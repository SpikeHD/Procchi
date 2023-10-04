use async_std::task;
use clap::{command, Parser};
use include_dir::{include_dir, Dir};
use rpassword::read_password;
use sha2::Digest;
use std::{io::Write, path::Path};
use tide::utils::async_trait;
use tide_acme::rustls_acme::caches::DirCache;
use tide_acme::{AcmeConfig, TideRustlsExt};
use tide_http_auth::{BasicAuthRequest, Storage};

#[cfg(feature = "plugins")]
use crate::plugins::parse_enable_plugins;

mod logger;
mod resource_watcher;
mod util;
mod web;

#[cfg(feature = "plugins")]
mod plugins;

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
pub struct Args {
  #[arg(short, long, default_value = "6565")]
  port: u16,

  /// Max amount of history to keep at once for each metric
  #[arg(short = 'm', long, default_value = "100")]
  history_max: usize,

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

  /// Plugins to enable, seperated by commas (eg. minecraft,docker)
  #[arg(short = 'e', long)]
  plugins: Option<String>,

  /// Enable HTTPS. Not really needed for testing locally, but recommended for outside access
  #[arg(short = 's', long)]
  https: bool,

  /// Log file path
  #[arg(short = 'l', long, default_value = "")]
  log_file: String,
}

fn main() {
  let tmp_dir = std::env::temp_dir();
  let mut args = Args::parse();
  let mut username = String::new();
  let pwd;

  // Init logger
  if !args.log_file.is_empty() {
    logger::init(args.log_file.clone());
  }

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
      history_max: args.history_max,
      update_rate: args.update_rate,
    },
  );

  // Register plugins
  #[cfg(feature = "plugins")]
  parse_enable_plugins(&mut app, args.plugins.clone(), args.address.clone());

  if args.https {
    logger::print_info(format!(
      "Putting ACME cache in {}/.acme_cache",
      tmp_dir.display()
    ));
  }

  logger::print_info(format!("Starting server on port {}...", args.port));
  logger::print_info(format!(
    "Retaining {} elements of metric history",
    args.history_max
  ));
  logger::print_info(format!("Updating every {} seconds", args.update_rate));
  logger::print_info(format!(
    "Done! Access the web interface at http{}://{}:{}/",
    // Lol this is so dumb
    if args.https { "s" } else { "" },
    args.address,
    args.port
  ));

  task::block_on(async {
    if args.https {
      app
        .listen(
          tide_rustls::TlsListener::build()
            .acme(
              AcmeConfig::new(vec![args.address.clone()])
                .cache(DirCache::new(format!("{}/.acme_cache", tmp_dir.display()))),
            )
            .addrs(format!("{}:{}", args.address.as_str(), args.port)),
        )
        .await
        .unwrap();
    } else {
      app
        .listen(format!("{}:{}", args.address.as_str(), args.port))
        .await
        .unwrap();
    }
  });
}

fn recursive_serve(app: &mut tide::Server<State>, path: Option<&Path>) {
  // For all dirs in the frontend dir (including the root), serve the files within
  let path = path.unwrap_or(FRONTEND_DIR.path());
  let dir = FRONTEND_DIR.get_dir(path).unwrap_or(&FRONTEND_DIR);

  for file in dir.files() {
    let path = format!("{}", file.path().display());

    logger::print_info(format!("Serving {}", path));

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
