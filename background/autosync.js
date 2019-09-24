const config = require("../config");
const ms = require("ms");
const axios = require("axios");
const shell = require("shelljs");
const fsp = require("fs").promises;

/**
 * Automatically syncs remote url targets to local static files in the background at a set interval
 */
class Autosync {
  constructor() {
    this.targets = config.get("autosync_targets");
    this.intervalHandles = [];
  }

  start() {
    console.log("[Autosync] starting..");

    // Start syncing each target on it's interval
    for (let target of this.targets) {
      const handle = setInterval(() => {
        this.syncTarget(target);
      }, parseInt(ms(target.interval)));
      this.intervalHandles.push(handle); // save a reference to the handle in case we want to stop it later
    }
  }

  /**
   * Force a sync of all targets immediately
   */
  forceSyncAll() {
    for (let target of this.targets) {
      this.syncTarget(target);
    }
  }

  /**
   * Syncs the remote url target to the destination file
   * @param target
   * @returns {Promise<void>}
   */
  async syncTarget(target) {
    let url = target.source.url;
    let path = target.dest.path;
    let file = path + "/" + target.dest.filename;

    // If there are sub-paths defined get them
    if (target.source.sub_paths && target.source.sub_paths.length > 0) {
      for (let subPath of target.source.sub_paths) {
        url = target.source.url + subPath;
        path = target.dest.path + subPath;
        file = path + "/" + target.dest.filename;

        this._syncSingleURL(url, path, file);
      }
    } else {
      this._syncSingleURL(url, path, file);
    }
  }

  async _syncSingleURL(url, path, file) {
    try {
      console.log("[Autosync] Getting target url:", url);
      let response = await axios.get(url);

      if (response) {
        // Make sure dest path exists
        if (!shell.test("-e", path)) {
          console.log("[Autosync] Making dir:", path);
          shell.mkdir("-p", path);
        }

        // Now write destination file
        //TODO: Only write file if it is different that what is currently on disk
        await fsp.writeFile(file, response.data);
        console.log("[Autosync] Successfully wrote dest file:", file);
        return true;
      }
    } catch (error) {
      console.error("[Autosync] Error synchronizing target:", error);
    }
  }
}

module.exports = Autosync;
