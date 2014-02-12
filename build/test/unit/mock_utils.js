'use strict';

var hasRunCommands = {};
var gaiaOriginURL = function(name, scheme, domain, port) {
  return scheme + name + '.' + domain + (port ? port : '');
};

exports.Q = require('q');

var joinPath = function() {
  var args = Array.prototype.slice.call(arguments);
    return args.join('/');
  };

exports.joinPath = joinPath;

exports.Commander = function(type) {
  hasRunCommands[type] = [];
  this.run = function(cmds, callback) {
    hasRunCommands[type].push(cmds.join(' '));
    callback && callback();
  };
  this.initPath = function() {
  };
};

exports.killAppByPid = function(appName) {
  hasRunCommands.sh.push('-c adb shell kill ' + appName);
};

exports.hasRunCommands = hasRunCommands;

exports.psParser = function(content) {
  return content;
};

exports.getEnvPath = function() {
};

exports.processEvents = function() {
};

exports.getJSON = function() {
};

exports.gaiaOriginURL = gaiaOriginURL;

exports.gaiaManifestURL = function(name, scheme, domain, port) {
  return gaiaOriginURL(name, scheme, domain, port) + '/manifest.webapp';
};

exports.getExtension = function(filename) {
  return filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
};

exports.isSubjectToBranding = function(path) {
  return /shared[\/\\][a-zA-Z]+[\/\\]branding$/.test(path) ||
         /branding[\/\\]initlogo.png/.test(path);
};
