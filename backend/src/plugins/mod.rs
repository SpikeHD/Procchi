use crate::State;

mod minecraft;

pub fn parse_enable_plugins(app: &mut tide::Server<State>, plugins: Option<String>, address: String) {
  if plugins.is_none() {
    return;
  }

  let plugins_string = plugins.unwrap();

  if plugins_string.is_empty() {
    return;
  }

  let plugins = plugins_string.split(",").collect::<Vec<&str>>();

  for plugin in plugins {
    match plugin {
      "minecraft" => minecraft::register(app, address.clone()),
      _ => {}
    }
  }
}