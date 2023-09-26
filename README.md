<div align=center>
  <h1>Procchi</h1>
  <p>Resource monitoring, accessible from the web.</p>
  <a href="https://www.discord.gg/agQ9mRdHMZ">https://discord.gg/agQ9mRdHMZ</a>
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

# Table of Contents

* [Installation](#installation)
* [Usage](#usage)
  * [Examples](#examples)
* [Development](#development)
  * [Prerequisites](#prerequisites)
  * [First Time Setup](#first-time-setup)
  * [Develop](#develop)
  * [Build](#build)
* [Contributing](#contributing)

# Installation

1. Download a release binary from the [releases page](https://github.com/SpikeHD/procchi/releases), and put it somewhere.
  1a. If you are on a Linux platform, you can move Procchi to `/usr/bin` to make it available system-wide:
    ```sh
    sudo mv procchi /usr/bin
    ```
2. That's it!

# Usage

Run the binary via terminal to view a full list of options:

```sh
./procchi -h
```

## Examples

Start Procchi on port 7766, with test authentication credentials
```sh
./procchi -p 7766 -u test -k test
```
*(If `-u` and `-k` are not specified, Procchi will prompt for credentials before deploying the web server, which is reccommended)*

Start Procchi on the default port (6565), have memory and CPU history tracked up to 10 minutes
```sh
./procchi -m 10m -c 10m
```

Start Procchi configured to update every 10 seconds (instead of the default of 5 seconds)
```sh
./procchi -r 10
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

If you are on a Unix/MacOS system with `bun` installed, you can run:
```sh
bun run start:bun
```

which will build and run Procchi in debug mode. Otherwise, you can run:
```sh
npm run start
```

## Build

If you are on a Unix/MacOS system with `bun` installed, you can run:
```sh
bun run build:bun
```

which will build a Procchi release. Otherwise, you can run:
```sh
npm run build
```

# Screenshots

<details>
  <summary>Click to expand</summary>
</details>

# Contributing

Issues, PRs, etc. are all welcome!


