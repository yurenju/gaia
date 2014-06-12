'use strict';

/* global exports, require, dump */

var r = require('r-wrapper');
var utils = require('utils');

exports.execute = function(options) {
  var stageAppDir = utils.getFile(options.STAGE_APP_DIR);
  var configFile = utils.getFile(options.APP_DIR, 'build',
    'require_config.jslike');

  utils.ensureFolderExists(stageAppDir);
  r.optimize(options.GAIA_DIR, configFile.path);
};
