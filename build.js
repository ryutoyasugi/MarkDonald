var packager = require('electron-packager');
var config = require('./package.json');

packager({
  dir          : '.',
  out          : 'dist',
  name         : config.name,
  'app-version': config.version,
  platform     : 'darwin', // or win
  arch         : 'x64',
  icon         : 'src/img/MarkDonald.icns',
  version      : '1.2.6', // electron version
  overwrite    : true
}, function done(err, path) {
  if (err) throw new Error(err);
  console.log('finished build app in ' + path);
});
