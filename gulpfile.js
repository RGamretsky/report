'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-csso');
var server = require('gulp-server-livereload');
var prefixer = require('gulp-autoprefixer');
var del = require('del');

var path = {
    build: {
        html: 'build/',
        templates: 'build/report/templates/',
        js: 'build/report/js/',
        css: 'build/report/css/',
        img: 'build/report/img/',
        example: 'build/example/',
        libs: 'build/libs/'
    },
    src: {
        html: 'src/*.html',
        templates: 'src/report/templates/**/*.*',
        js: 'src/report/js/*.js',
        css: 'src/report/css/*.css',
        img: 'src/report/img/**/*.*',
        example: 'src/example/**/*.*',
        libs: 'src/libs/**/**/*.*'
    },
    clean: './build'
};

gulp.task('start', function() {
    gulp.src('build')
        .pipe(server({
            livereload: true,
            open: true,
            host: 'localhost',
            port: 8080
        }));
});

/*
gulp.task('fonts', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});
*/
gulp.task('templates', function() {
    gulp.src(path.src.templates)
        .pipe(gulp.dest(path.build.templates));
});
gulp.task('images', function() {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img));
});
gulp.task('css', function() {
    gulp.src(path.src.css)
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest(path.build.css));
});
gulp.task('js', function() {
    gulp.src(path.src.js)
        .pipe(gulp.dest(path.build.js));
});
gulp.task('example', function() {
    gulp.src(path.src.example)
        .pipe(gulp.dest(path.build.example));
});
gulp.task('libs', function() {
    gulp.src(path.src.libs)
        .pipe(gulp.dest(path.build.libs));
});
gulp.task('clean', function() {
    return del([
        'build',
    ]);
});

gulp.task('build', ['templates', 'images', 'css', 'js', 'example', 'libs'], function() {
    return gulp.src('src/*.html')
        //.pipe(gulpif('*.js', uglify()))
        //.pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/**/*.*', ['build']);
});

gulp.task('default', ['build', 'start', 'watch']);