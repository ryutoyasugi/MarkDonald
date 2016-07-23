var gulp     = require('gulp');
var sass     = require('gulp-sass');
var plumber  = require('gulp-plumber');
var electron = require('electron-connect').server.create();

gulp.task('default', function() {

  electron.start();

  gulp.watch('main.js',
    electron.restart);

  gulp.watch(['index.html', 'src/js/*.js', 'dest/**/*'],
    electron.reload);

  gulp.watch('src/css/*.scss',
    ['sass']);
});

gulp.task('sass', function() {
  gulp.src('src/css/*.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('dest/css/'));
});