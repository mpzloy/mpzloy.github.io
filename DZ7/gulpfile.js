const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const less = require('gulp-less');
const rigger = require('gulp-rigger');

gulp.task('css', function () {
    return gulp.src(['./src/less/style.less'])
        .pipe(less())
        .pipe(autoprefixer({
            browser: ['>1%']
        }))
        .pipe(gulp.dest('./build/css'))
});

gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('./build/'))
});

gulp.task('fonts', function () {
    return gulp.src('./src/fonts/*.*')
        .pipe(rigger())
        .pipe(gulp.dest('./build/'))
});