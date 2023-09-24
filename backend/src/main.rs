use std::path::Path;

use async_std::task;
use include_dir::{include_dir, Dir};
use clap::{Parser, command};

static FRONTEND_DIR: Dir = include_dir!("../frontend/dist");

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
  #[arg(short, long, default_value = "6565")]
  port: u16,
}

fn main() {
  // Server the frontend dir using tide
  let mut app = tide::new();
  let args = Args::parse();

  // Server index.html at the root
  app.at("/").get(
    move |_req: tide::Request<()>| async move {
      let mut res = tide::Response::new(200);
      res.set_body(FRONTEND_DIR.get_file("index.html").unwrap().contents().to_vec());
      res.set_content_type("text/html");
      Ok(res)
    },
  );

  recursive_serve(&mut app, None);

  task::block_on(async {
    app.listen(
      format!("127.0.0.1:{}", args.port),
    ).await.unwrap();
  })
}

fn recursive_serve(app: &mut tide::Server<()>, path: Option<&Path>) {
  // For all dirs in the frontend dir (including the root), serve the files within
  let path = path.unwrap_or(FRONTEND_DIR.path());
  let dir = FRONTEND_DIR.get_dir(path).unwrap_or(&FRONTEND_DIR);

  for file in dir.files() {
    let path = format!("{}", file.path().display());

    println!("Serving {}", path);

    app.at(&path).get(
      move |_req: tide::Request<()>| async move {
        let mut res = tide::Response::new(200);
        res.set_body(file.contents().to_vec());
        res.set_content_type(mime_guess::from_path(file.path()).first().unwrap().essence_str());
        Ok(res)
      },
    );
  }

  // For all dirs in dir, recursively serve the files within
  for dir in dir.dirs() {
    recursive_serve(app, Some(dir.path()));
  }
}