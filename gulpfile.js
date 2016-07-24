var gulp     = require('gulp');
var uglify   = require("gulp-uglify");
var sass     = require('gulp-sass');
var plumber  = require('gulp-plumber');
var electron = require('electron-connect').server.create();

gulp.task('default', function() {

  electron.start();

  gulp.watch('main.js',
    electron.restart);

  gulp.watch(['index.html', 'dest/**/*'],
    electron.reload);

  gulp.watch('src/js/*.js',
    ['uglify']);

  gulp.watch('src/css/*.scss',
    ['sass']);
});

gulp.task('uglify', function() {
  gulp.src('src/js/*.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest('dest/js/'));
});

gulp.task('sass', function() {
  gulp.src('src/css/*.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('dest/css/'));
});