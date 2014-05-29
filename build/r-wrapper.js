'use strict';

/* global exports, require, Services, dump, Reflect */

var utils = require('utils');
const { Cc, Ci, Cu } = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/reflect.jsm');

exports.optimize = function(optionsPath, gaiaDir) {
  var rjs = utils.getFile(gaiaDir);
  rjs.append('build');
  rjs.append('r.js');
  var ruri = Services.io.newFileURI(rjs).asciiSpec;
  var win = {
    Components: {
      classes: Cc,
      interfaces: Ci,
      utils: Cu
    },
    arguments: ['-o', optionsPath],
    print: function() {
      var output = [...arguments].join(' ');
      dump(output + '\n');
    },
    // requirejsAsLib: true,
    Reflect: Reflect
  };
  Services.scriptloader.loadSubScript(ruri, win);
  return win;
};
