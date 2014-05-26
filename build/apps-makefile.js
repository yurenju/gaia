'use strict';

/* global exports, require */

var utils = require('utils');

var AppsMakefileGenerator = function(options) {
  this.options = options;
  this.gaiaDir = utils.getFile(options.GAIA_DIR);
  this.stageDir = utils.getFile(options.STAGE_DIR);
  this.makefile = utils.getFile(options.STAGE_DIR, 'Makefile');
  this.commommk = utils.getFile(options.GAIA_DIR, 'build', 'common.mk')
};


AppsMakefileGenerator.prototype.getRule = function(appdir) {
  const STAGE_DIR = this.options.STAGE_DIR;
  var stageAppDir = utils.getFile(STAGE_DIR, appdir.leafName);
  var rule = {
    name: stageAppDir.getRelativeDescriptor(this.gaiaDir),
    lines: []
  };
  var makefile = appdir.clone();
  makefile.append('Makefile');

  if (makefile.exists()) {
    rule.lines.push('STAGE_APP_DIR="'+ STAGE_DIR + '/' +
      appdir.leafName +'" make -C "' + appdir.path + '"');
  } else {
    rule.lines.push('cp -LR "' + appdir.path + '" ' + STAGE_DIR);
    var buildJsFile = utils.getFile(appdir.path, 'build', 'build.js');
    if (buildJsFile.exists()) {
      rule.lines.push('export APP_DIR="' + appdir.path + '"');
      rule.lines.push('$(call run-js-command,app/build)');
    }
  }
  return rule;
};

AppsMakefileGenerator.prototype.getAppRules = function() {
  const BUILD_APP_NAME = this.options.BUILD_APP_NAME;
  const GAIA_APPDIRS = this.options.GAIA_APPDIRS;
  var rules = [];
  var buildAppDir;
  var appdirs = GAIA_APPDIRS.split(' ').map(function(dir) {
    var appdir = utils.getFile(dir);
    if (appdir.leafName === BUILD_APP_NAME) {
      buildAppDir = appdir;
    }
    return appdir;
  });

  if (buildAppDir) {
    rules.push(this.getRule(buildAppDir));
    return rules;
  }

  rules = appdirs.map(function(dir) {
    return this.getRule(dir);
  }, this);
  return rules;
};

AppsMakefileGenerator.prototype.getDependencies = function(rules) {
  return rules.map(function(rule) {
    return rule.name;
  }).join(' ');
}

AppsMakefileGenerator.prototype.serializeRules = function(rules) {
  var output = [];

  output.push('include ' + this.commommk.getRelativeDescriptor(this.stageDir));
  output.push('');

  output.push('all: ' + this.getDependencies(rules));
  output.push('');

  rules.forEach(function(rule) {
    output.push(rule.name + ':');
    output.push('\t@' + rule.lines.join(' && ') + '\n');
  });
  return output.join('\n');
};

AppsMakefileGenerator.prototype.execute = function() {
  utils.writeContent(this.makefile, this.serializeRules(this.getAppRules()));
};

exports.execute = function(options) {
  var generator = new AppsMakefileGenerator(options);
  generator.execute();
};
