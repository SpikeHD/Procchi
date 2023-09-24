use crate::resource_watcher::ResourceWatcher;

pub struct ApiSettings {
  pub mem_history_max: u64,
  pub cpu_history_max: u64,
}

// Create a ResourceWatcher and start it
static mut RESOURCE_WATCHER: Option<ResourceWatcher> = None;

pub fn register_routes(app: &mut tide::Server<()>, settings: ApiSettings) {
  unsafe {
    RESOURCE_WATCHER = Some(ResourceWatcher::new(settings));
    RESOURCE_WATCHER.as_ref().unwrap().start();
  }

  app.at("/api/memory").get(memory);
  app.at("/api/swap").get(swap);
  app.at("/api/cpu").get(cpu);
}

pub async fn memory(_req: tide::Request<()>) -> Result<tide::Response, tide::Error> {
  let watcher = unsafe { RESOURCE_WATCHER.as_ref().unwrap() };
  let mut res = tide::Response::new(200);

  res.set_body(serde_json::to_vec(&watcher.mem_history).unwrap());
  res.set_content_type("application/json");

  Ok(res)
}

pub async fn swap(_req: tide::Request<()>) -> Result<tide::Response, tide::Error> {
  let watcher = unsafe { RESOURCE_WATCHER.as_ref().unwrap() };
  let mut res = tide::Response::new(200);

  res.set_body(serde_json::to_vec(&watcher.swap_history).unwrap());
  res.set_content_type("application/json");

  Ok(res)
}

pub async fn cpu(_req: tide::Request<()>) -> Result<tide::Response, tide::Error> {
  let watcher = unsafe { RESOURCE_WATCHER.as_ref().unwrap() };
  let mut res = tide::Response::new(200);

  res.set_body(serde_json::to_vec(&watcher.cpu_history).unwrap());
  res.set_content_type("application/json");

  Ok(res)
}