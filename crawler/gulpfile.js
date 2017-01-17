'use strict';

const gulp = require('gulp');
const tsc = require('gulp-tsc');
const shell = require('gulp-shell');
const runseq = require('run-sequence');
const tslint = require('gulp-tslint');

const paths = {
  tscripts: {
    src: ['app/**/*.ts'],
    dest: 'build',
  },
};

gulp.task('default', ['lint', 'buildrun']);

// ** Running ** //

gulp.task('run', shell.task([
  'node build/index.js',
]));

gulp.task('buildrun', (cb) => {
  runseq('build', 'run', cb);
});

// ** Watching ** //

gulp.task('watch', () => {
  gulp.watch(paths.tscripts.src, ['compile:typescript']);
});

gulp.task('watchrun', () => {
  gulp.watch(paths.tscripts.src, runseq('compile:typescript', 'run'));
});

// ** Compilation ** //

gulp.task('build', ['compile:typescript']);
gulp.task('compile:typescript', () => {
  return gulp
    .src(paths.tscripts.src)
    .pipe(tsc({
      module: 'commonjs',
      emitError: false,
    }))
    .pipe(gulp.dest(paths.tscripts.dest));
});

// ** Linting ** //

gulp.task('lint', ['lint:default']);
gulp.task('lint:default', () => {
  return gulp.src(paths.tscripts.src)
    .pipe(tslint())
    .pipe(tslint.report('prose', {
      emitError: false,
    }));
});
