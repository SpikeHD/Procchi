use serde::Serialize;
use std::{sync::{Arc, Mutex}, collections::HashMap};
use sysinfo::{CpuExt, DiskExt, NetworkExt, PidExt, ProcessExt, System, SystemExt};

use crate::web::api::ApiSettings;

#[derive(Clone, Copy, Serialize)]
pub struct Memory {
  timestamp: u64,
  total: u64,
  used: u64,
  available: u64,
}

#[derive(Clone, Copy, Serialize)]
pub struct Cpu {
  timestamp: u64,
  // This is a percentage
  used: f32,
}

#[derive(Clone, Serialize)]
pub struct Process {
  name: String,
  pid: u32,
  cpu: f32,
  mem: u64,
}

#[derive(Clone, Serialize)]
pub struct DiskUsage {
  timestamp: u64,
  total: u64,
  used: u64,
}

#[derive(Clone, Serialize)]
pub struct NetworkUsage {
  timestamp: u64,
  recieve: u64,
  transmit: u64,
}

#[derive(Clone)]
pub struct ResourceWatcher {
  update_rate: u64,
  pub mem_history: Arc<Mutex<Vec<Memory>>>,
  pub swap_history: Arc<Mutex<Vec<Memory>>>,
  pub cpu_history: Arc<Mutex<Vec<Cpu>>>,
  pub disks: Arc<Mutex<HashMap<String, Vec<DiskUsage>>>>,
  pub network: Arc<Mutex<HashMap<String, Vec<NetworkUsage>>>>,
  pub mem_history_max: usize,
  pub cpu_history_max: usize,
  pub process_list: Arc<Mutex<Vec<Process>>>,
  system: Arc<Mutex<System>>,
}

impl ResourceWatcher {
  pub fn new(settings: ApiSettings) -> Self {
    Self {
      update_rate: settings.update_rate,
      mem_history: Arc::new(Mutex::new(Vec::new())),
      swap_history: Arc::new(Mutex::new(Vec::new())),
      cpu_history: Arc::new(Mutex::new(Vec::new())),
      disks: Arc::new(Mutex::new(HashMap::new())),
      network: Arc::new(Mutex::new(HashMap::new())),
      mem_history_max: settings.mem_history_max as usize,
      cpu_history_max: settings.cpu_history_max as usize,
      process_list: Arc::new(Mutex::new(Vec::new())),
      system: Arc::new(Mutex::new(System::new_all())),
    }
  }

  pub fn start(&self) {
    let mut clone = self.clone();

    // Spawn a thread that updates memory and CPU usage every 15 seconds
    std::thread::spawn(move || loop {
      clone.update();
      std::thread::sleep(std::time::Duration::from_secs(clone.update_rate));
    });
  }

  pub fn update(&mut self) {
    let mut system = self.system.as_ref().lock().unwrap();
    let mut mem_history = self.mem_history.as_ref().lock().unwrap();
    let mut swap_history = self.swap_history.as_ref().lock().unwrap();
    let mut cpu_history = self.cpu_history.as_ref().lock().unwrap();
    let mut disks = self.disks.as_ref().lock().unwrap();
    let mut networks = self.network.as_ref().lock().unwrap();
    let mut process_list = self.process_list.as_ref().lock().unwrap();

    system.refresh_cpu();
    system.refresh_memory();
    system.refresh_processes();

    let mem = system.total_memory();
    let free = system.free_memory();
    let swap = system.total_swap();
    let swap_free = system.free_swap();
    let available = system.available_memory();
    let used = mem - free;
    let timestamp = std::time::SystemTime::now()
      .duration_since(std::time::UNIX_EPOCH)
      .unwrap()
      .as_secs();

    mem_history.push(Memory {
      timestamp,
      total: mem,
      used,
      available,
    });

    if mem_history.len() > self.mem_history_max {
      mem_history.remove(0);
    }

    swap_history.push(Memory {
      timestamp,
      total: swap,
      used: swap - swap_free,
      available: swap_free,
    });

    if swap_history.len() > self.mem_history_max {
      swap_history.remove(0);
    }

    let mut cpu_use_avg = 0.0;

    // Grab all CPUs and calc average usage
    for cpu in system.cpus() {
      cpu_use_avg += cpu.cpu_usage();
    }

    cpu_history.push(Cpu {
      timestamp,
      used: cpu_use_avg / system.cpus().len() as f32,
    });

    if cpu_history.len() > self.cpu_history_max {
      cpu_history.remove(0);
    }

    // For each disk name, add it's current usage to it's list in the hashmap
    for disk in system.disks() {
      let name = format!("{:?}", disk.name()).replace("\"", "");

      if !disks.contains_key(&name) {
        disks.insert(name.clone(), Vec::new());
      }

      let disk_vec = disks.get_mut(&name).unwrap();

      disk_vec.push(DiskUsage {
        timestamp,
        total: disk.total_space(),
        used: disk.total_space() - disk.available_space(),
      });

      if disk_vec.len() > self.mem_history_max {
        disk_vec.remove(0);
      }
    }

    // Same with network usage
    for (name, data) in system.networks() {
      if !networks.contains_key(name) {
        networks.insert(name.clone(), Vec::new());
      }

      let network_vec = networks.get_mut(name).unwrap();

      network_vec.push(NetworkUsage {
        timestamp,
        recieve: data.received(),
        transmit: data.transmitted(),
      });
    }

    // Clear the old process list
    process_list.clear();

    for (pid, process) in system.processes() {
      process_list.push(Process {
        name: process.name().to_string(),
        pid: pid.as_u32(),
        cpu: process.cpu_usage(),
        mem: process.memory(),
      });
    }
  }
}
