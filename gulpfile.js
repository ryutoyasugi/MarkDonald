var gulp     = require('gulp');
var coffee   = require('gulp-coffee');
var uglify   = require("gulp-uglify");
var sass     = require('gulp-sass');
var plumber  = require('gulp-plumber');
var electron = require('electron-connect').server.create();

gulp.task('default', ['coffee', 'sass'], function() {

  electron.start();

  gulp.watch('main.js',
    electron.restart);

  gulp.watch(['index.html', 'dest/**/*'],
    electron.reload);

  gulp.watch('src/js/*.coffee',
    ['coffee']);

  gulp.watch('src/css/*.scss',
    ['sass']);
});

gulp.task('coffee', function() {
  gulp.src('src/js/*.coffee')
    .pipe(plumber())
    .pipe(coffee())
    .pipe(uglify())
    .pipe(gulp.dest('dest/js/'));
});

gulp.task('sass', function() {
  gulp.src('src/css/*.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('dest/css/'));
});