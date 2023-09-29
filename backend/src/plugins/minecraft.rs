use mcping;
use serde::Serialize;

use crate::State;

#[derive(Serialize, Clone)]
struct McData {
  description: String,
  players: i64,
  version: String,
  latency: u64,
  address: String,
}

static mut ACCESS_ADDRESS: String = String::new();

pub fn register(app: &mut tide::Server<State>, access_address: String) -> Vec<String> {
  println!("Enabling Minecraft plugin");

  unsafe {
    ACCESS_ADDRESS = access_address;
  }

  app.at("/api/minecraft").get(minecraft);

  vec![String::from("/api/minecraft")]
}

pub async fn minecraft(_req: tide::Request<State>) -> Result<tide::Response, tide::Error> {
  let access_address = unsafe { ACCESS_ADDRESS.clone() };
  let mut data = McData {
    description: String::from("Unknown"),
    players: 0,
    version: String::from("Unknown"),
    latency: 0,
    address: access_address.clone(),
  };

  let (latency, response) = match mcping::get_status(access_address.as_str(), None) {
    Ok(response) => response,
    Err(_) => {
      let mut res = tide::Response::new(200);

      res.set_body(serde_json::to_vec(&data).unwrap());
      res.set_content_type("application/json");

      return Ok(res);
    }
  };

  data.latency = latency;
  data.description = response.description.text().to_string();
  data.players = response.players.online;
  data.version = response.version.name;

  let mut res = tide::Response::new(200);

  res.set_body(serde_json::to_vec(&data).unwrap());
  res.set_content_type("application/json");

  Ok(res)
}