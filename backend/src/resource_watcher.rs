use std::sync::{Arc, Mutex};
use serde::Serialize;
use sysinfo::{System, SystemExt, CpuExt, ProcessExt, PidExt, DiskExt, NetworkExt};

use crate::api::ApiSettings;

#[derive(Clone, Copy, Serialize)]
pub struct Memory {
  timestamp: u64,
  total: u64,
  used: u64,
  available: u64,
}

#[derive(Clone, Copy, Serialize)]
pub struct CPU {
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
pub struct Disk {
  name: String,
  total: u64,
  used: u64,
}

#[derive(Clone, Serialize)]
pub struct Network {
  name: String,
  recieve: u64,
  transmit: u64,
}

#[derive(Clone)]
pub struct ResourceWatcher {
  update_rate: u64,
  pub mem_history: Arc<Mutex<Vec<Memory>>>,
  pub swap_history: Arc<Mutex<Vec<Memory>>>,
  pub cpu_history: Arc<Mutex<Vec<CPU>>>,
  pub disks: Arc<Mutex<Vec<Disk>>>,
  pub network: Arc<Mutex<Vec<Network>>>,
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
      disks: Arc::new(Mutex::new(Vec::new())),
      network: Arc::new(Mutex::new(Vec::new())),
      mem_history_max: settings.mem_history_max as usize,
      cpu_history_max: settings.cpu_history_max as usize,
      process_list: Arc::new(Mutex::new(Vec::new())),
      system: Arc::new(Mutex::new(System::new_all())),
    }
  }

  pub fn start(&self) {
    let mut clone = self.clone();

    // Spawn a thread that updates memory and CPU usage every 15 seconds
    std::thread::spawn(move || {
      loop {
        clone.update();
        std::thread::sleep(std::time::Duration::from_secs(clone.update_rate));
      }
    });
  }

  pub fn update(&mut self) {
    let mut system = self.system.as_ref().lock().unwrap();
    let mut mem_history = self.mem_history.as_ref().lock().unwrap();
    let mut swap_history = self.swap_history.as_ref().lock().unwrap();
    let mut cpu_history = self.cpu_history.as_ref().lock().unwrap();
    let mut disks = self.disks.as_ref().lock().unwrap();
    let mut network = self.network.as_ref().lock().unwrap();
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
    let timestamp = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();

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

    cpu_history.push(CPU {
      timestamp,
      used: cpu_use_avg / system.cpus().len() as f32,
    });

    if cpu_history.len() > self.cpu_history_max {
      cpu_history.remove(0);
    }

    // Clear the old disk list
    disks.clear();

    for disk in system.disks() {
      disks.push(Disk {
        name: format!("{:?}", disk.name()),
        total: disk.total_space(),
        used: disk.total_space() - disk.available_space(),
      });
    }

    // Clear the old network list
    network.clear();

    for (name, data) in system.networks() {
      network.push(Network {
        name: name.to_string(),
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