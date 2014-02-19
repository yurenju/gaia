var fs = require('fs');
var path = require('path');
var config = require('./customizeConfig.js');
var maxImagePixelSize = 5 * 1024 * 1024;

var gaiaDistributionDirectory = process.env.GAIA_DISTRIBUTION_DIR;
var configurationObject = {};
var configurationFile;

var generateConfigurationFile = function() {
  var content = config.customizeMaximumImageSize(configurationObject);
  var configPath = path.join(process.env['BUILD_DIR'], 'js/config.js');

  fs.writeFile(configPath, content, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Configuration file has been generated: js/config.js');
    }
  });
};

if (gaiaDistributionDirectory) {
  fs.readFile(gaiaDistributionDirectory + '/camera.json',
              'utf8', function(err, data) {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('The configuration file :' + gaiaDistributionDirectory +
                    '/camera.json doesn\'t exist');
      } else {
        return console.log(err);
      }
    } else {
      configurationObject = JSON.parse(data);
    }
    generateConfigurationFile();
  });
} else {
  generateConfigurationFile();
}
