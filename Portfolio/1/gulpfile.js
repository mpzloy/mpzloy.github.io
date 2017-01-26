"use strict";
/****************************************************************************************************/
//MODULES REQUIRE
/****************************************************************************************************/
const gulp = require('gulp'),
    postcss = require('gulp-postcss'),
    csso = require('postcss-csso'),
    customProperties = require('postcss-custom-properties'),
    apply = require('postcss-apply'),
    postcssNesting = require('postcss-nesting'),
    postcssNested = require('postcss-nested'),
    autoprefixer = require('autoprefixer'),
    rigger = require('gulp-rigger'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    newer = require('gulp-newer'),
    debug = require('gulp-debug'),
    mmq = require('gulp-merge-media-queries'),
    gulpIf = require('gulp-if'),
    imagemin = require('gulp-imagemin'),
    svgmin = require('gulp-svgmin'),
    svgSymbols = require('gulp-svg-symbols'),
    smushit = require('gulp-smushit'),
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),
    flatten = require('gulp-flatten'),
    browserSync = require('browser-sync').create(),
    remember = require('gulp-remember'),
    cached = require('gulp-cached'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    order = require("gulp-order"),
    cssmin = require('gulp-cssmin'),
    path = require('path');

/****************************************************************************************************/
//DEV OR PRODUCTION
/****************************************************************************************************/
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';
/****************************************************************************************************/
//PATHS
/****************************************************************************************************/
const cms = {
    lp: {
        html: 'build',
        css: 'build/css',
        js: 'build/js',
        img: 'build/img/',
        libs: 'build/libs',
        fonts: 'build/fonts',
    }
};
/****************************************************************************************************/
//HTML task
/****************************************************************************************************/
gulp.task('html', () => {
    return gulp.src('src/*.html', {since: gulp.lastRun('html')})
        .pipe(rigger())
        .pipe(gulp.dest(cms.lp.html))
});

/****************************************************************************************************/
//HTML templates task
/****************************************************************************************************/
gulp.task('html:templates', () => {
    return gulp.src('src/*.html')
        .pipe(rigger())
        .pipe(gulp.dest(cms.lp.html))
});
/****************************************************************************************************/
//CSS task
/****************************************************************************************************/
gulp.task('css', () => {
    let processors = [
        customProperties,
        apply,
        postcssNesting,
        postcssNested,
        autoprefixer({
            browsers: ['last 10 versions']
        }),
        csso({restructure: false, debug: true})
    ];
    return gulp.src('src/css/*.css')
        .pipe(cached('css'))
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(remember('css'))
        .pipe(order([
            "src/css/normalize.css",
            "src/css/vars.css",
            "src/css/style.css"
        ], {base: './'}))
        .pipe(concat("style.css"))
        .pipe(postcss(processors))
        .pipe(mmq({log: true}))
        .pipe(gulpIf(!isDevelopment, cssmin({keepSpecialComments: 0})))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest(cms.lp.css))
        .pipe(browserSync.stream())
});
/****************************************************************************************************/
//JS task
/****************************************************************************************************/
gulp.task('js', () => {
    return gulp.src('src/js/main.js')
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(rigger())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulpIf(!isDevelopment, uglify()))
        .pipe(gulpIf(isDevelopment, sourcemaps.write()))
        .pipe(gulp.dest(cms.lp.js))
        .pipe(browserSync.stream())
});
/****************************************************************************************************/
//LIBS task
/****************************************************************************************************/
gulp.task('libs', () => {
    return gulp.src(mainBowerFiles(
        {
            "overrides": {
                "jquery": {
                    "main": "dist/jquery.min.js"
                },
                "svg4everybody": {
                    "main": "dist/svg4everybody.min.js"
                },
                "photoswipe": {
                    "main": [
                        "dist/photoswipe.min.js",
                        "dist/photoswipe.css",
                        "dist/photoswipe-ui-default.min.js",
                        "dist/default-skin/default-skin.css",
                        "dist/default-skin/default-skin.png",
                        "dist/default-skin/default-skin.svg",
                        "dist/default-skin/preloader.gif"
                    ]
                }
            }
        }
    ), {base: "./src/libs"})
        .pipe(flatten({includeParents: 1}))
        .pipe(newer(cms.lp.libs))
        .pipe(gulp.dest(cms.lp.libs))
});
/****************************************************************************************************/
//FONTS task
/****************************************************************************************************/
gulp.task('fonts', () => {
    return gulp.src('src/fonts/**/*.*')
        .pipe(newer(cms.lp.fonts))
        .pipe(gulpIf(isDevelopment, gulp.symlink(cms.lp.fonts), gulp.dest(cms.lp.fonts)))
});
/****************************************************************************************************/
//IMG task (jpg,png,gif)
/****************************************************************************************************/
gulp.task('img', () => {
    return gulp.src(['src/img/**/*.{jpg,png,gif}', 'src/images/**/*.{jpg,png,gif}'], {base: "src"})
        .pipe(newer(cms.lp.img))
        .pipe(gulpIf(!isDevelopment, imagemin({progressive: true})))
        // .pipe(gulpIf(!isDevelopment, smushit({verbose: true})))
        .pipe(gulpIf(isDevelopment, gulp.symlink(cms.lp.img), gulp.dest(cms.lp.img)))
});
/****************************************************************************************************/
//SVG task
/****************************************************************************************************/
gulp.task('svg', () => {
    return gulp.src('src/img/svg/*.svg', {base: 'src'})
        .pipe(newer(cms.lp.img))
        .pipe(gulpIf(!isDevelopment, gulp.dest(cms.lp.img), gulp.symlink(cms.lp.img)))
});
/****************************************************************************************************/
//SVG sprite icons
/****************************************************************************************************/
gulp.task('svg:icons', () => {
    return gulp.src('src/img/svg/icons/*.svg')
        .pipe(cached('svg:icons'))
        .pipe(svgmin({
            plugins: [
                {removeEditorsNSData: true},
                {removeTitle: true}
            ]
        }))
        .pipe(remember('svg:icons'))
        .pipe(svgSymbols({
            title: '%f icon',
            svgClassname: 'svg-icon-lib',
            templates: [
                'default-svg'
            ]
        }))
        .pipe(gulp.dest('src/img/svg'))
});
/****************************************************************************************************/
//DEL build directory
/****************************************************************************************************/
gulp.task('clean', () => del('build'));
/****************************************************************************************************/
//WATCHERS
/****************************************************************************************************/
gulp.task('watch', done => {
    gulp.watch('src/*.html', gulp.series('html')).on('unlink', function (filepath) {
        let filePathFromSrc = path.relative(path.resolve('src/'), filepath);
        let destFilePath = path.resolve(cms.lp.html, filePathFromSrc);
        del.sync(destFilePath);
    });
    gulp.watch('src/templates/*.html', gulp.series('html:templates'));
    gulp.watch('build/*.html').on('change', browserSync.reload);
    gulp.watch('src/css/*.css', gulp.series('css')).on('unlink', function (filepath) {
        remember.forget('css', path.resolve(filepath));
        delete cached.caches.css[path.resolve(filepath)];
    });
    gulp.watch('src/js/*.js', gulp.series('js'));
    gulp.watch('src/**/*.{jpg,png,gif}', gulp.series('img')).on('unlink', function (filepath) {
        let filePathFromSrc = path.relative(path.resolve('src/'), filepath);
        let destFilePath = path.resolve(cms.lp.img, filePathFromSrc);
        del.sync(destFilePath);
    });
    gulp.watch('src/img/svg/*.svg', gulp.series('svg')).on('unlink', function (filepath) {
        let filePathFromSrc = path.relative(path.resolve('src/'), filepath);
        let destFilePath = path.resolve(cms.lp.img, filePathFromSrc);
        del.sync(destFilePath);
    });
    gulp.watch('src/img/svg/icons/*.svg', gulp.series('svg:icons')).on('unlink', function (filepath) {
        remember.forget('svg:icons', path.resolve(filepath));
        delete cached.caches['svg:icons'][path.resolve(filepath)];
    });
    gulp.watch('src/fonts/**/*.*', gulp.series('fonts')).on('unlink', function (filepath) {
        let filePathFromSrc = path.relative(path.resolve('src/fonts'), filepath);
        let destFilePath = path.resolve(cms.lp.fonts, filePathFromSrc);
        del.sync(destFilePath);
    });
    done();
});
/****************************************************************************************************/
//BROWSER-SYNC task
/****************************************************************************************************/
gulp.task('serve', done => {
    browserSync.init({
        proxy: "gulp.loc",
        browser: "chrome",
        startPath: '/build',
        open: false
    });
    done();
});
/****************************************************************************************************/
//GLOBAL TASKS
/****************************************************************************************************/
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'js', 'libs', 'fonts', 'img', 'svg:icons'), 'svg'));
gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
