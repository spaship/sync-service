const config = require("../config");
// const axios = require("axios");
// const fs = require("fs");

class Autosync {
  constructor() {
    this.targets = config.get("autosync_targets");

    this.targets.forEach(target => {
      console.log("interval", target.interval);
      console.log("source.url", target.source.url);
    });
  }

  start() {
    console.log("[Autosync] starting..");
  }
}

module.exports = Autosync;
