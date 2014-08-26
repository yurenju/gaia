'use strict';

/* global require */

var utils = require('utils');

function getTimestamp(dirPaths) {
  let timestamp = {};

  dirPaths.forEach(function(dirPath) {
    timestamp[dirPath] = {};
    let dir = utils.getFile(dirPath);
    if (dir.exists() && dir.isDirectory()) {
      utils.ls(dir, true).forEach(function(file) {
        let relativePath = file.getRelativeDescriptor(dir)
        timestamp[dirPath][relativePath] = file.lastModifiedTime;
      });
    }
  });
  return timestamp;
}

exports.execute = function(options) {
  var appDirs = options.GAIA_APPDIRS.split(' ');
  var timestamp = getTimestamp(appDirs);
  var timestampFile = utils.getFile(options.STAGE_DIR, 'timestamp.json');
  var rebuildAppDirs = [];

  if (timestampFile.exists()) {
    let previous = JSON.parse(utils.getFileContent(timestampFile));
    for (let appDir in timestamp) {
      for (let filepath in timestamp[appDir]) {
        if (timestamp[appDir][filepath] > previous[appDir][filepath]) {
          rebuildAppDirs.push(appDir);
          break;
        }
      }
    }
  } else {
    rebuildAppDirs = appDirs;
  }
  utils.writeContent(timestampFile, JSON.stringify(timestamp, null, 2));
  dump("rebuildAppDirs: " + JSON.stringify(rebuildAppDirs) + "\n");
}
