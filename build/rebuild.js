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

function dirChanged(previous, current, dir) {
  for (let filepath in current) {
    if (current[filepath] > previous[filepath] || !previous[filepath]) {
      utils.log('rebuild', 'file has been changed: ' + dir + '/' + filepath);
      return true;
    }
  }
  return false;
}

exports.execute = function(options) {
  var scanningDirs = options.GAIA_APPDIRS.split(' ');
  var sharedPath = utils.getFile(options.GAIA_DIR, 'shared').path;
  scanningDirs.push(sharedPath);
  var current = getTimestamp(scanningDirs);
  var timestampFile = utils.getFile(options.STAGE_DIR, 'timestamp.json');
  var rebuildAppDirs = [];

  if (timestampFile.exists()) {
    let previous = JSON.parse(utils.getFileContent(timestampFile));
    let sharedChanged = dirChanged(previous[sharedPath], current[sharedPath], sharedPath);

    if (sharedChanged) {
      rebuildAppDirs = scanningDirs;
    } else {
      for (let appDir in current) {
        if (dirChanged(previous[appDir], current[appDir], appDir)) {
          rebuildAppDirs.push(appDir);
        }
      }
    }
  } else {
    rebuildAppDirs = scanningDirs;
  }
  utils.writeContent(timestampFile, JSON.stringify(current, null, 2));
  utils.log('rebuild', 'rebuildAppDirs: ' + JSON.stringify(rebuildAppDirs));
  return rebuildAppDirs;
}
