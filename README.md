[![Build Status](https://travis-ci.org/dakom/hello-purescript-worker.svg?branch=master)](https://travis-ci.org/dakom/hello-purescript-worker)

## [LIVE DEMO](https://dakom.github.io/hello-purescript-worker)

Boilerplate for using Purescript within a web-worker project, i.e. something that's driven like a game loop 

* The outer shell (typescript) is only used for IO (including worker message passing)
* Messages are based on frame-ticks and gated accordingly
* The core logic is in Purescript

## Setup
* `npm install`
* `psc-package install`

## Development
* `npm run dev:auto-reload`

At the moment it seems the webpack plugin doesn't hook into the psc-ide properly
One way to work around this is to run `pscid`
Another way is probably to kickstart the ide manually or run the vim plugin (I had issues with this)

## Build
* `npm run build`
