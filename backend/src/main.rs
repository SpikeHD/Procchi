use async_std::task;
use clap::{command, Parser};
use include_dir::{include_dir, Dir};
use rpassword::read_password;
use sha2::Digest;
use std::{io::Write, path::Path};
use tide::utils::async_trait;
use tide_http_auth::{BasicAuthRequest, Storage};

mod resource_watcher;
mod util;
mod web;

static FRONTEND_DIR: Dir = include_dir!("../frontend/dist");

#[derive(Clone)]
struct User {
  username: String,

  // Password is the hashed password using sha156
  password: Vec<u8>,
}

#[derive(Clone)]
pub struct State {
  user: User,
}

impl State {
  fn new(username: String, password: Vec<u8>) -> Self {
    Self {
      user: User { username, password },
    }
  }
}

#[async_trait]
impl Storage<User, BasicAuthRequest> for State {
  async fn get_user(&self, req: BasicAuthRequest) -> tide::Result<Option<User>> {
    let hashed_password: Vec<u8> = sha2::Sha256::digest(req.password.as_bytes()).to_vec();

    if req.username == self.user.username && hashed_password == self.user.password {
      Ok(Some(self.user.clone()))
    } else {
      Ok(None)
    }
  }
}

/// Resource monitor, entirely accessible from the web
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
  #[arg(short, long, default_value = "6565")]
  port: u16,

  /// Max amount of memory history to keep at once
  #[arg(short, long, default_value = "5m")]
  mem_history_max: String,

  /// Max amount of CPU history to keep at once
  #[arg(short, long, default_value = "5m")]
  cpu_history_max: String,

  /// Rate (in seconds) at which to update the resource monitor
  #[arg(short = 'r', long, default_value = "5")]
  update_rate: u64,

  /// Username to use for authentication
  #[arg(short, long)]
  username: Option<String>,

  /// Password to use for authentication. Not reccommended, use the prompt instead
  #[arg(short = 'k', long)]
  password: Option<String>,

  /// Access address
  #[arg(short = 'a', long, default_value = "127.0.0.1")]
  address: String,
}

fn main() {
  let mut args = Args::parse();
  let mut username = String::new();
  let pwd;

  if args.username.is_none() || args.password.is_none() {
    // Prompt for username
    print!("Username to use while authenticating: ");
    std::io::stdout().flush().unwrap();
    std::io::stdin().read_line(&mut username).unwrap();

    // Prompt for password
    print!("Password to use while authenticating: ");
    std::io::stdout().flush().unwrap();
    pwd = sha2::Sha256::digest(read_password().unwrap().as_bytes()).to_vec();
  } else {
    username = args.username.unwrap();
    pwd = sha2::Sha256::digest(args.password.unwrap().as_bytes()).to_vec();

    // Remove the password from memory
    args.password = None;
  }

  // Create a new stat with the username and hashed password
  let state = State::new(username.trim().to_string(), pwd);
  let mut app = tide::with_state(state);

  app.with(tide_http_auth::Authentication::new(
    tide_http_auth::BasicAuthScheme {},
  ));

  // Out own middleware that always verifies requests
  app.with(web::middleware::AuthMiddleware {});

  // Server index.html at the root
  app
    .at("/")
    .get(move |_req: tide::Request<State>| async move {
      let mut res = tide::Response::new(200);
      res.set_body(
        FRONTEND_DIR
          .get_file("index.html")
          .unwrap()
          .contents()
          .to_vec(),
      );
      res.set_content_type("text/html");

      Ok(res)
    });

  recursive_serve(&mut app, None);

  web::api::register_routes(
    &mut app,
    web::api::ApiSettings {
      mem_history_max: util::relative_to_seconds(args.mem_history_max.clone()),
      cpu_history_max: util::relative_to_seconds(args.cpu_history_max.clone()),
      update_rate: args.update_rate,
    },
  );

  println!("Starting server on port {}...", args.port);
  println!("Retaining {} of memory history", args.mem_history_max);
  println!("Retaining {} of CPU history", args.cpu_history_max);
  println!("Updating every {} seconds", args.update_rate);
  println!(
    "Done! Access the web interface at http://{}:{}/",
    args.address,
    args.port
  );

  task::block_on(async {
    app
      .listen(format!("{}:{}", args.address, args.port))
      .await
      .unwrap();
  })
}

fn recursive_serve(app: &mut tide::Server<State>, path: Option<&Path>) {
  // For all dirs in the frontend dir (including the root), serve the files within
  let path = path.unwrap_or(FRONTEND_DIR.path());
  let dir = FRONTEND_DIR.get_dir(path).unwrap_or(&FRONTEND_DIR);

  for file in dir.files() {
    let path = format!("{}", file.path().display());

    println!("Serving {}", path);

    app
      .at(&path)
      .get(move |_req: tide::Request<State>| async move {
        let mut res = tide::Response::new(200);
        res.set_body(file.contents().to_vec());
        res.set_content_type(
          mime_guess::from_path(file.path())
            .first()
            .unwrap()
            .essence_str(),
        );
        Ok(res)
      });
  }

  // For all dirs in dir, recursively serve the files within
  for dir in dir.dirs() {
    recursive_serve(app, Some(dir.path()));
  }
}
