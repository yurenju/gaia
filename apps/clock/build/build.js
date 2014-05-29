'use strict';

/* global exports, require */

var r = require('r-wrapper');
var utils = require('utils');
var generateSharedConfig = require('./make_gaia_shared');

exports.execute = function(options) {
  var stageAppDir = utils.getFile(options.STAGE_APP_DIR);
  var configFile = utils.getFile(options.APP_DIR, 'build',
    'require_config.jslike');

  utils.ensureFolderExists(stageAppDir);
  var win = r.optimize(configFile.path, options.GAIA_DIR);
  // generateSharedConfig.generate(win, options.APP_DIR, options.STAGE_APP_DIR);

  // var sharedDir = stageAppDir.clone();
  // sharedDir.append('shared');
  // sharedDir.remove(true);
};
