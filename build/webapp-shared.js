/*global require, exports*/
'use strict';
var utils = require('./utils');

var WebappShared = function() {
};

WebappShared.prototype.setOptions = function(options) {
  this.config = options.config;
  this.gaia = options.gaia;
  this.webapp = options.webapp;
  this.used = {
    js: [],              // List of JS file paths to copy
    locales: [],         // List of locale names to copy
    resources: [],       // List of resources to copy
    styles: [],          // List of stable style names to copy
    unstable_styles: []  // List of unstable style names to copy
  };
  this.localesFile = utils.resolve(this.config.LOCALES_FILE,
    this.config.GAIA_DIR);
  if (!this.localesFile.exists()) {
    throw new Error('LOCALES_FILE doesn\'t exists: ' + this.localesFile.path);
  }

  this.buildDir = utils.getFile(this.webapp.buildDirectoryFile.parent.path,
    this.webapp.sourceDirectoryName);
};

WebappShared.prototype.pickByResolution = function(originalPath, targetPath) {
  if (!/\.(png|gif|jpg)$/.test(originalPath)) {
    return targetPath;
  }
  var matchResult = /@([0-9]+\.?[0-9]*)x/.exec(originalPath);
  if ((this.config.GAIA_DEV_PIXELS_PER_PX === '1' && matchResult) ||
      (matchResult &&
        matchResult[1] !== this.config.GAIA_DEV_PIXELS_PER_PX)) {
    return;
  }

  if (this.config.GAIA_DEV_PIXELS_PER_PX !== '1') {
    var suffix = '@' + this.config.GAIA_DEV_PIXELS_PER_PX + 'x';
    if (matchResult && matchResult[1] ===
        this.config.GAIA_DEV_PIXELS_PER_PX) {
      // Save the hidpi file to the build dir,
      // strip the name to be more generic.
      return targetPath.replace(suffix, '');
    } else {
      // Check if there a hidpi file. If yes, let's ignore this bitmap since
      // it will be loaded later (or it has already been loaded, depending on
      // how the OS organize files.
      var hqfile = utils.getFile(originalPath.
                         replace(/(\.[a-z]+$)/, suffix + '$1'));
      if (hqfile.exists()) {
        return;
      }
    }
  }
  return targetPath;
};

WebappShared.prototype.moveToBuildDir = function(file, targetPath) {
  if (file.isHidden()) {
    return;
  }
  var path = file.path;

  targetPath = this.pickByResolution(path, targetPath);
  if (!targetPath) {
    return;
  }

  if (utils.isSubjectToBranding(path)) {
    file.append((this.config.OFFICIAL == 1) ? 'official' : 'unofficial');
  }

  if (!file.exists()) {
    throw new Error('Can\'t add inexistent file to  : ' + path);
  }

  // nsIZipWriter should not receive any path starting with `/`,
  // it would put files in a folder with empty name...
  targetPath = targetPath.replace(/^\/+/, '');

  // Case 1/ Regular file
  if (file.isFile()) {
    try {
      if (/\.html$/.test(file.leafName)) {
        // this file might have been pre-translated for the default locale
        var l10nFile = file.parent.clone();
        l10nFile.append(file.leafName + '.' + this.config.GAIA_DEFAULT_LOCALE);
        if (l10nFile.exists()) {
          utils.copyFileTo(l10nFile, this.buildDir.path, targetPath, true);
          return;
        }
      }

      var re = new RegExp('\\.html\\.' + this.config.GAIA_DEFAULT_LOCALE);
      if (!re.test(file.leafName)) {

        utils.copyFileTo(file, this.buildDir.path, targetPath, true);
      }
    } catch (e) {
      throw new Error('Unable to add following file in stage: ' +
                      path + '\n' + e);
    }
  }
  // Case 2/ Directory
  else if (file.isDirectory()) {
    utils.copyDirTo(file, this.buildDir.path, targetPath, true);
  }
};

/**
 * Copy a "Building Block" (i.e. shared style resource)
 *
 * @param {String}       blockName name of the building block to copy.
 * @param {String}       dirName   name of the shared directory to use.
 */
WebappShared.prototype.copyBuildingBlock =
  function(blockName, dirName) {
    var dirPath = 'shared/' + dirName + '/';

    // Compute the nsIFile for this shared style
    var styleFolder = this.gaia.sharedFolder.clone();
    styleFolder.append(dirName);
    var cssFile = styleFolder.clone();
    if (!styleFolder.exists()) {
      throw new Error('Using inexistent shared style: ' + blockName);
    }

    cssFile.append(blockName + '.css');
    var pathInStage = dirPath + blockName + '.css';
    this.moveToBuildDir(cssFile, pathInStage);

    // Copy everything but index.html and any other HTML page into the
    // style/<block> folder.
    var subFolder = styleFolder.clone();
    subFolder.append(blockName);
    utils.ls(subFolder, true).forEach(function(file) {
      var relativePath = file.getRelativeDescriptor(styleFolder);
      // Ignore HTML files at style root folder
      if (relativePath.match(/^[^\/]+\.html$/)) {
        return;
      }
      // Do not process directory as `addToZip` will add files recursively
      if (file.isDirectory()) {
        return;
      }
      this.moveToBuildDir(file, dirPath + relativePath);
    }.bind(this));
  };

WebappShared.prototype.pushJS = function(path) {
  var file = this.gaia.sharedFolder.clone();
  file.append('js');
  path.split('/').forEach(function(segment) {
    file.append(segment);
  });
  if (!file.exists()) {
    throw new Error('Using inexistent shared JS file: ' + path + ' from: ' +
                    this.webapp.domain);
  }
  var pathInStage = 'shared/js/' + path;
  this.moveToBuildDir(file, pathInStage);
};

WebappShared.prototype.pushResource = function(path) {
  let file = this.gaia.sharedFolder.clone();
  file.append('resources');
  path.split('/').forEach(function(segment) {
    file.append(segment);
    if (utils.isSubjectToBranding(file.path)) {
      file.append((this.config.OFFICIAL == 1) ? 'official' : 'unofficial');
    }
  }.bind(this));

  if (!file.exists()) {
    throw new Error('Using inexistent shared resource: ' + path +
                    ' from: ' + this.webapp.domain + '\n');
  }

  if (path === 'languages.json') {
    var pathInStage = 'shared/resources/languages.json';
    this.moveToBuildDir(this.localesFile, pathInStage);
    return;
  }

  // Add not only file itself but all its hidpi-suffixed versions.
  let fileNameRegexp = new RegExp(
      '^' + file.leafName.replace(/(\.[a-z]+$)/, '(@.*x)?\\$1') + '$');
  utils.ls(file.parent, false).forEach(function(listFile) {
    if (fileNameRegexp.test(listFile.leafName)) {
      var pathInStage = 'shared/resources/' + path;
      this.moveToBuildDir(listFile, pathInStage);
    }
  }.bind(this));

  if (file.isDirectory()) {
    utils.ls(file, true).forEach(function(fileInResources) {
      var pathInStage = 'shared' +
        fileInResources.path.substr(this.gaia.sharedFolder.path.length);
      this.moveToBuildDir(fileInResources, pathInStage);
    }.bind(this));
  }

  if (path === 'media/ringtones/' && this.gaia.distributionDir &&
    utils.getFile(this.gaia.distributionDir, 'ringtones').exists()) {
    this.moveToBuildDir(utils.getFile(this.gaia.distributionDir, 'ringtones'),
      'ringtones');
  }
};

WebappShared.prototype.pushLocale = function(name) {
  var localeFolder = this.gaia.sharedFolder.clone();
  localeFolder.append('locales');
  var ini = localeFolder.clone();
  localeFolder.append(name);
  if (!localeFolder.exists()) {
    throw new Error('Using inexistent shared locale: ' + name + ' from: ' +
                    this.webapp.domain);
  }
  ini.append(name + '.ini');
  if (!ini.exists()) {
    throw new Error('Using inexistent shared locale: ' + name + ' from: ' +
                    this.webapp.domain);
  }
  // And the locale folder itself
  this.moveToBuildDir(localeFolder, 'shared/locales/' + name );
  // Add the .ini file
  var pathInStage = 'shared/locales/' + name + '.ini';
  this.moveToBuildDir(ini, pathInStage);
  utils.ls(localeFolder, true).forEach(function(fileInSharedLocales) {

    var relativePath =
      fileInSharedLocales.path.substr(this.config.GAIA_DIR.length + 1);

    this.moveToBuildDir(fileInSharedLocales, relativePath);
  }.bind(this));
};

WebappShared.prototype.pushFileByType = function(kind, path) {
  switch (kind) {
    case 'js':
      if (this.used.js.indexOf(path) == -1) {
        this.used.js.push(path);
        this.pushJS(path);
      }
      break;
    case 'resources':
      if (this.used[kind].indexOf(path) == -1) {
        this.used.resources.push(path);
        this.pushResource(path);
      }
      break;
    case 'style':
      var styleName = path.substr(0, path.lastIndexOf('.'));
      if (this.used.styles.indexOf(styleName) == -1) {
        this.used.styles.push(styleName);
        this.copyBuildingBlock(styleName, 'style');
      }
      break;
    case 'style_unstable':
      var unstableStyleName = path.substr(0, path.lastIndexOf('.'));
      if (this.used.unstable_styles.indexOf(unstableStyleName) == -1) {
        this.used.unstable_styles.push(unstableStyleName);
        this.copyBuildingBlock(unstableStyleName, 'style_unstable');
      }
      break;
    case 'locales':
      if (this.config.GAIA_INLINE_LOCALES !== '1') {
        var localeName = path.substr(0, path.lastIndexOf('.'));
        if (this.used.locales.indexOf(localeName) == -1) {
          this.used.locales.push(localeName);
          this.pushLocale(localeName);
        }
      }
      break;
  }
};

WebappShared.prototype.filterSharedUsage = function(file) {
  var SHARED_USAGE =
      /<(?:script|link).+=['"]\.?\.?\/?shared\/([^\/]+)\/([^''\s]+)("|')/g;
  var content = utils.getFileContent(file);
  var matches = null;
  while((matches = SHARED_USAGE.exec(content))!== null) {
    let kind = matches[1]; // js | locales | resources | style
    let path = matches[2];
    this.pushFileByType(kind, path);
  }
};

WebappShared.prototype.filterHTML = function(file) {
  var EXTENSIONS_WHITELIST = ['html'];
  var extension = utils.getExtension(file.leafName);
  return file.isFile() && EXTENSIONS_WHITELIST.indexOf(extension) != -1;
};

WebappShared.prototype.copyShared = function() {
  // If config.BUILD_APP_NAME isn't `*`, we only accept one webapp
  if (this.config.BUILD_APP_NAME != '*' &&
    this.webapp.sourceDirectoryName != this.config.BUILD_APP_NAME) {
    return;
  }
  // Zip generation is not needed for external apps, aaplication data
  // is copied to profile webapps folder in webapp-manifests.js
  if (utils.isExternalApp(this.webapp)) {
    return;
  }

  var files = utils.ls(this.webapp.buildDirectoryFile, true);
  files.filter(this.filterHTML).forEach(this.filterSharedUsage.bind(this));
  this.customizeShared();
};

WebappShared.prototype.customizeShared = function() {
  var self = this;
  var sharedDataFile = this.webapp.buildDirectoryFile.clone();
  sharedDataFile.append('gaia_shared.json');
  if (sharedDataFile.exists()) {
    var sharedData = JSON.parse(utils.getFileContent(sharedDataFile));
    Object.keys(sharedData).forEach(function(kind) {
      sharedData[kind].forEach(function(path) {
        self.pushFileByType(kind, path);
      });
    });
  }
};

WebappShared.prototype.execute = function(options) {
  this.setOptions(options);
  this.copyShared();
};

function execute(config) {
  var gaia = utils.getGaia(config);
  gaia.webapps.forEach(function(webapp) {
    (new WebappShared()).execute({
      config: config, gaia: gaia, webapp: webapp});
  });
}

exports.execute = execute;
exports.WebappShared = WebappShared;
