'use strict';

/* global exports, require, Services, dump, Reflect */

var utils = require('utils');
const { Cc, Ci, Cu } = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/reflect.jsm');

exports.optimize = function(gaiaDir, configPath) {
  var rjs = utils.getFile(gaiaDir);
  rjs.append('build');
  rjs.append('r.js');
  var ruri = Services.io.newFileURI(rjs).spec;
  var global = {
    Components: {
      classes: Cc,
      interfaces: Ci,
      utils: Cu
    },
    print: console.log.bind(console),
    arguments: ['-o', configPath],
    Reflect: Reflect
  };
  Services.scriptloader.loadSubScript(ruri, global);
}