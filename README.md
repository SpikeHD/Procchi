<div align=center>
  <h1>
    <img height="100px" src="frontend/src/assets/procchi_icon.png" />
    <br />
    Procchi
  </h1>
</div>

<div align="center">
 <img src="https://img.shields.io/github/actions/workflow/status/SpikeHD/procchi/build.yml" />
 <img src="https://img.shields.io/github/package-json/v/SpikeHD/procchi" />
 <img src="https://img.shields.io/github/repo-size/SpikeHD/procchi" />
</div>
<div align="center">
 <img src="https://img.shields.io/github/commit-activity/m/SpikeHD/procchi" />
 <img src="https://img.shields.io/github/release-date/SpikeHD/procchi" />
 <img src="https://img.shields.io/github/stars/SpikeHD/procchi" />
</div>

<div align="center">
  Stupid simple, in-memory system monitoring, accessible from the web.
  <br />
  https://discord.gg/agQ9mRdHMZ
</div>


# Table of Contents

* [Screenshots](#screenshots)
* [Installation](#installation)
* [Usage](#usage)
  * [Examples](#examples)
* [Developing](#developing)
  * [Prerequisites](#prerequisites)
  * [First Time Setup](#first-time-setup)
  * [Develop](#develop)
  * [Build](#build)
* [TODO](#todo)
* [Contributing](#contributing)

# Screenshots

<details>
  <summary>Click to expand</summary>
  <img width="1676" alt="image" src="https://github.com/SpikeHD/Procchi/assets/25207995/e06f567f-86f2-4fb7-a375-c4b65a448288">
  <img width="1676" alt="image" src="https://github.com/SpikeHD/Procchi/assets/25207995/ebcd8917-c323-4778-96a1-fa04380dab41">
</details>

# Installation

1. Download a release binary from the [releases page](https://github.com/SpikeHD/procchi/releases) or from [actions](https://github.com/SpikeHD/procchi/actions), and put it somewhere.

   1a. If you are on a Linux platform, you can move Procchi to `/usr/bin` to make it available system-wide:
    ```sh
    sudo mv procchi /usr/bin
    ```
3. That's it!

# Usage

Run the binary via terminal to view a full list of options:

```sh
./procchi -h
```

## Examples

```sh
# Start Procchi on port 7766, with test authentication credentials
./procchi -p 7766 -u test -k test
# (If `-u` and `-k` are not specified, Procchi will prompt for credentials before deploying the web server, which is reccommended)

# Start Procchi on the default port (6565), and have it retain a max of 50 elements in metric history for each metric
./procchi -m 50

# Start Procchi configured to update every 10 seconds (instead of the default of 5 seconds)
./procchi -r 10

# Start procchi with the access address pointing to the external IP address of the machine
./procchi -a <machine IP>
```

# Developing

## Prerequisites

* Node.js (20.x) or Bun (latest)
* Cargo/Rust (latest)

## First time setup

1. Clone the repository
2. Install frontend dependencies
    ```sh
    cd frontend
    npm install
    cd ..
    ```
3. That's it!

## Develop

To start in dev mode:
```sh
# If you have "bun" installed
bun run start:bun

# Otherwise
npm run start
```

## Build

To build a release:
```sh
# If you have "bun" installed
bun run build:bun

# Otherwise
npm run build
```

# TODO

* [ ] Better mobile formatting
* [ ] "Plugins" for specific process types
  * [x] Minecraft Server(s)
  * [ ] Docker containers
  * [ ] Logs (nginx, apache, syslog, etc.)

# Contributing

Issues, PRs, etc. are all welcome!


