interface Memory {
  timestamp: number;
  total: number;
  used: number;
  available: number;
}

interface CPU {
  timestamp: number;
  used: number; // This is a percentage
}

interface Process {
  name: string;
  pid: number;
  cpu: number;
  mem: number;
}

interface SystemInfo {
  mem_size: number;
  swap_size: number;
  cpu_count: number;
  cpu_brand: string;
  cpu_model: string;
  cpu_vendor: string;
  cpu_frequency: number;
  os_name: string;
  os_version: string;
  hostname: string;
  uptime: number;
}