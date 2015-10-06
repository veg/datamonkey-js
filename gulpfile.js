var gulp = require('gulp'),
    watchify = require('watchify'),
    reactify = require('reactify'), 
    concat = require('gulp-concat'),
    bower = require('gulp-bower'),
    gulpFilter = require('gulp-filter');
    bower_files = require('main-bower-files'),
    path = require('path'),
    react = require('gulp-react'),
    less = require('gulp-less'),
    debug = require('gulp-debug');

var config = {
     bowerDir: './src/bower-components/',
     lessDir: './src/less/' 
}

gulp.task("scripts", function() {
    var filterJS = gulpFilter('**/*.js');
    gulp.src(bower_files( { paths: {
        bowerDirectory: config.bowerDir,
        bowerrc: './.bowerrc',
        bowerJson: './bower.json'
     }, 
    "overrides": {
        "crossfilter": {
          "main": [
            "crossfilter.js",
          ]
        },
        "socket.io-client": {
          "main": [
            "socket.io.js",
          ]
        },
        "react": {
          "main": [
            "react-with-addons.js",
          ]
        },
        "flea": {
              "dependencies": null
            }
    }}), { base: config.bowerDir })
    .pipe(filterJS)
    .pipe(concat('./vendor.js'))
    .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task("css", function(){
    var filterJS = gulpFilter('**/*.css');
    gulp.src(bower_files( { paths: {
        bowerDirectory: config.bowerDir,
        bowerrc: './.bowerrc',
        bowerJson: './bower.json'
     }, 
    "overrides": {
      "font-awesome": {
        "main": [
          "css/font-awesome.css",
        ]
      },
      "jquery-file-upload": {
        "main": [
          "css/jquery.fileupload.css",
        ]
      },
      "flea": {
            "dependencies": null
          }
    }}), { base: config.bowerDir })
    .pipe(filterJS)
    .pipe(concat('./vendor.css'))
    .pipe(gulp.dest('./public/assets/css/'));
});


gulp.task('fonts', function() {
    return gulp.src([path.join(config.bowerDir, '/font-awesome/fonts/fontawesome-webfont.*')])
            .pipe(debug())
            .pipe(gulp.dest('./public/fonts/'));
});

gulp.task('bs-fonts', function() {
    return gulp.src([path.join(config.bowerDir, '/bootstrap/fonts/*')])
            .pipe(debug())
            .pipe(gulp.dest('./public/assets/fonts/'));
});


gulp.task('react', function () {
    return gulp.src('./src/jsx/jobqueue.jsx')
        .pipe(react())
        .pipe(gulp.dest('./public/assets/js/'));
});


gulp.task('bootstrap', function () {
    return gulp.src(path.join(config.lessDir, 'bootstrap.less'))
        .pipe(less())
        .pipe(gulp.dest('./public/assets/css/'));
});

// Just running the two tasks
gulp.task('default', ['scripts', 'react', 'css', 'fonts', 'bootstrap', 'bs-fonts'], function() {
  process.exit(0);
});

