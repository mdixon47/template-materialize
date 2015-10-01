var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    concat = require('gulp-concat'),
    jade = require('gulp-jade'),
    path = require('path');

var env,
    jsSources,
    sassSources,
    jadeSources,
    htmlSources,
    outputDir,
    sassStyle;

env = 'development';

if (env==='development') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}

jsSources = [
  'components/scripts/animation.js',
  'components/scripts/parallax.js',
  'components/scripts/scrollfire.js',
  'components/scripts/script.js'
];
sassSources = ['components/sass/*.scss'];
htmlSources = [outputDir + '*.html'];
jadeSources = ['components/jade/*.jade'];

gulp.task('js', function() {
  gulp.src(jsSources)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .on('error', gutil.log)
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
    .pipe(connect.reload())
});

gulp.task('compass', function() {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass',
      css: outputDir + 'css',
      image: outputDir + 'images',
      style: sassStyle
    })
    .on('error', gutil.log))
    //.pipe(gulp.dest( outputDir + 'css'))
    .pipe(connect.reload())
});

gulp.task('watch', function() {
  gulp.watch(jsSources, ['js']);
  gulp.watch(['components/sass/*.scss', 'components/sass/*/*.scss'], ['compass']);
  gulp.watch(['components/jade/*.jade', 'components/jade/*/*.jade'], ['jade']);

});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task('jade', function(event){
  return gulp.src('components/jade/*.jade')
  .pipe(jade({pretty: true}))
  .pipe(gulp.dest('builds/development'))
  .pipe(connect.reload())
});

gulp.task('html', function() {
  gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
    .pipe(connect.reload())
});

// Copy images to production
gulp.task('move', function() {
  gulp.src('builds/development/images/**/*.*')
  .pipe(gulpif(env === 'production', gulp.dest(outputDir+'images')))
});

gulp.task('default', ['watch', 'html', 'js', 'compass', 'move','jade', 'connect' ]);
