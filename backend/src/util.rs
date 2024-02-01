// Convert times like 10m or 10h to seconds
pub fn _relative_to_seconds(rel: impl AsRef<str>) -> u64 {
  let rel = rel.as_ref();
  let chars = rel.chars();
  let mut num = String::new();
  let mut unit = String::new();

  for c in chars {
    if c.is_numeric() {
      num.push(c);
    } else {
      unit.push(c);
    }
  }

  let num = num.parse::<u64>().unwrap();

  match unit.as_str() {
    "s" => num,
    "m" => num * 60,
    "h" => num * 60 * 60,
    "d" => num * 60 * 60 * 24,
    "w" => num * 60 * 60 * 24 * 7,
    "y" => num * 60 * 60 * 24 * 365,
    _ => panic!("Invalid unit {}", unit),
  }
}

pub fn version_string() -> String {
  format!(
    r#"{{ "name": "Procchi", "version": "{}.{}.{}", "author": "{}" }}"#,
    env!("CARGO_PKG_VERSION_MAJOR"),
    env!("CARGO_PKG_VERSION_MINOR"),
    env!("CARGO_PKG_VERSION_PATCH"),
    env!("CARGO_PKG_AUTHORS")
  )
}