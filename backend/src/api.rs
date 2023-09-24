use sysinfo::{SystemExt, System, CpuExt};
use serde::Serialize;

use crate::resource_watcher::ResourceWatcher;

pub struct ApiSettings {
  pub mem_history_max: u64,
  pub cpu_history_max: u64,
}

#[derive(Serialize, Clone)]
pub struct SystemInfo {
  mem_size: u64,
  swap_size: u64,
  cpu_count: u64,
  cpu_brand: String,
  cpu_model: String,
  cpu_vendor: String,
  cpu_frequency: u64,
  os_name: String,
  os_version: String,
  hostname: String,
  uptime: u64,
}

// Create a ResourceWatcher and start it
static mut RESOURCE_WATCHER: Option<ResourceWatcher> = None;
static mut SYSTEM_INFO: Option<SystemInfo> = None;

pub fn register_routes(app: &mut tide::Server<()>, settings: ApiSettings) {
  unsafe {
    RESOURCE_WATCHER = Some(ResourceWatcher::new(settings));
    RESOURCE_WATCHER.as_ref().unwrap().start();
  }

  app.at("/api/memory").get(memory);
  app.at("/api/swap").get(swap);
  app.at("/api/cpu").get(cpu);
  app.at("/api/sysinfo").get(sysinfo);
}

pub fn fetch_system_info() {
  unsafe {
    let system = System::new_all();

    SYSTEM_INFO = Some(SystemInfo {
      mem_size: system.total_memory(),
      swap_size: system.total_swap(),
      cpu_count: system.cpus().len() as u64,
      cpu_brand: system.global_cpu_info().brand().to_string(),
      cpu_model: system.global_cpu_info().name().to_string(),
      cpu_vendor: system.global_cpu_info().vendor_id().to_string(),
      cpu_frequency: system.global_cpu_info().frequency(),
      os_name: system.name().unwrap_or(String::from("Unknown")),
      os_version: system.os_version().unwrap_or(String::from("Unknown")),
      hostname: system.host_name().unwrap_or(String::from("Unknown")),
      uptime: system.uptime(),
    });
  }
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

pub async fn sysinfo(_req: tide::Request<()>) -> Result<tide::Response, tide::Error> {
  unsafe {
    if SYSTEM_INFO.is_none() {
      fetch_system_info();
    }
  }

  let sysinfo = unsafe { SYSTEM_INFO.as_ref().unwrap() };
  let mut res = tide::Response::new(200);

  res.set_body(
    serde_json::to_vec(sysinfo).unwrap(),
  );
  res.set_content_type("application/json");

  Ok(res)
}