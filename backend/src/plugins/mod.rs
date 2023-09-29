use crate::State;
use serde::Serialize;

mod minecraft;

#[derive(Serialize, Clone)]
struct Plugin {
  name: String,
  endpoints: Vec<String>,
}

static mut PLUGINS: Vec<Plugin> = vec![];

pub fn parse_enable_plugins(
  app: &mut tide::Server<State>,
  plugins: Option<String>,
  address: String,
) {
  if plugins.is_none() {
    return;
  }

  let plugins_string = plugins.unwrap();

  if plugins_string.is_empty() {
    return;
  }

  let plugins = plugins_string.split(",").collect::<Vec<&str>>();
  let mut registered_endpoints = vec![];

  for plugin in plugins {
    let endpoints = match plugin {
      "minecraft" => minecraft::register(app, address.clone()),
      _ => {
        vec![]
      }
    };

    for endpoint in endpoints {
      println!("Registered endpoint: {}", endpoint);
      registered_endpoints.push(Plugin {
        name: plugin.to_string(),
        endpoints: vec![endpoint],
      });
    }
  }

  unsafe {
    PLUGINS = registered_endpoints;
  }

  app.at("/api/plugins").get(plugins_route);
}

async fn plugins_route(_req: tide::Request<State>) -> Result<tide::Response, tide::Error> {
  let mut res = tide::Response::new(200);

  unsafe {
    res.set_body(serde_json::to_vec(&PLUGINS).unwrap());
  }

  res.set_content_type("application/json");

  Ok(res)
}
