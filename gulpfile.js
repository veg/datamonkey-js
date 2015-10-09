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
    watch = require('gulp-watch'),
    debug = require('gulp-debug'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify');

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
    .pipe(sourcemaps.init())
      .pipe(concat('./vendor.js'))
      .pipe(gulp.dest('./public/assets/js/'))
      .pipe(rename('vendor.min.js'))
      .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task("worker-scripts", function() {
  gulp.src([ './src/bower-components/underscore/underscore.js', './src/bower-components/d3/d3.js'])
    .pipe(concat('./worker-vendor.js'))
    .pipe(gulp.dest('./public/assets/js/'));
});

gulp.task("css", function() {
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
    .pipe(sourcemaps.init())
      .pipe(concat('./vendor.css'))
    .pipe(sourcemaps.write('../../public/assets/css/'))
    .pipe(gulp.dest('./public/assets/css/'));
});

gulp.task('fonts', function() {
    return gulp.src([path.join(config.bowerDir, '/font-awesome/fonts/fontawesome-webfont.*')])
            .pipe(gulp.dest('./public/assets/fonts/'));
});

gulp.task('bs-fonts', function() {
    return gulp.src([path.join(config.bowerDir, '/bootstrap/fonts/*')])
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

gulp.task('default', ['build'], function() {
  process.exit(0);
});

gulp.task('build', ['scripts', 'worker-scripts', 'react', 'css', 'fonts', 'bootstrap', 'bs-fonts']);

gulp.task('watch', function () {
    watch('src/**/*', function () {
        gulp.start('build');
    });
});


