use colored::Colorize;
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::sync::Mutex;

// Open a LOG_FILE in the default log directory
static mut LOG_FILE: Option<Mutex<File>> = None;

pub fn init(path: String) {
  unsafe {
    LOG_FILE = Some(Mutex::new(
      OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .expect("Permission denied when opening log file"),
    ));
  }
}

pub fn append_logfile(message: String) {
  if unsafe { LOG_FILE.as_ref().is_none() } {
    return;
  }

  let pretty_date = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
  let mut file = unsafe { LOG_FILE.as_ref().unwrap().lock().unwrap() };
  file
    .write_all(format!("{} | {}\n", pretty_date, message).as_bytes())
    .unwrap();
}

pub fn print_pretty(kind: String, message: impl AsRef<str> + std::fmt::Display) {
  let pretty_date = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
  println!("[{}] {} {}", pretty_date, kind.bold(), message);
}

pub fn _print_error(message: impl AsRef<str> + std::fmt::Display) {
  print_pretty("[ERROR]".red().to_string(), &message);

  // Write to log file
  append_logfile(format!("[ERROR] {}", message));
}

pub fn _print_warning(message: impl AsRef<str> + std::fmt::Display) {
  print_pretty("[WARNING]".yellow().to_string(), &message);

  // Write to log file
  append_logfile(format!("[WARNING] {}", message));
}

pub fn print_info(message: impl AsRef<str> + std::fmt::Display) {
  print_pretty("[INFO]".blue().to_string(), &message);

  // Write to log file
  append_logfile(format!("[INFO] {}", message));
}
