const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const less = require('gulp-less');
const concat = require('gulp-concat');
const rigger = require('gulp-rigger');
const minify = require('gulp-minify-css');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const mainBowerFile = require('main-bower-file');
const flatten = require('gulp-flatten');
const smushit = require('gulp-smushit');
const svgmin = require('gulp-svgmin');
const svgSimbols = require('gulp-svg-simbols');
const babel = require('gulp-babel');


gulp.task('css', function () {
    return gulp.src(['./src/less/style.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['> 0.1%'],
            cascade: false
        }))
        .pipe(minify())
        .pipe(gulp.dest('./build/css'))
        .pipe(browserSync.stream(()));
});

gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('./build/'))
});

gulp.task('fonts', function () {
    return gulp.src('./src/fonts/*.*')
        .pipe(rigger())
        .pipe(gulp.dest('./build/fonts'))
});





//watch
gulp.task('watch', function () {
    gulp.watch('./src/css/*.less', gulp.series('css'));
    gulp.watch('./src/*html', gulp.series('html'));
    gulp.watch('./build/*.html').on('change', browserSync.reload)
});

gulp.task('server', function () {
    browserSync.init({
        proxy:"",// название проэкта
        browser:"chrom",
        startPatch:'/build',
        notify:false,
        open:false
    })
})

gulp.task('dev', gulp.parallel('watch', 'server'));
