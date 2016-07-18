var gulp = require('gulp');
var electron = require('electron-connect').server.create();

gulp.task('start', function() {
  electron.start();
  gulp.watch(['main.js'], electron.restart);
  gulp.watch(['index.html', 'src/**/*.{js,css}'], electron.reload);
});
