var config = {
    src: './src/',
    dest: './src/',
    css: {
        watch: 'less/**/*.less',
        src: 'less/**/*.less',
        dest: 'css'
    },
    html: {
        watch: 'index.html',
    }
};

var gulp = require('gulp');
var less = require('gulp-less');
var minify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');


gulp.task('less', function(){
    
    gulp.src(config.src + config.css.src)
        .pipe(less())
        .pipe(autoprefixer({
			browsers: ['> 0.1%'],
			cascade: false
		}))
        .pipe(minify())
        .pipe(gulp.dest(config.dest + config.css.dest));
    
});

gulp.task('watch', function(e){
    gulp.watch(config.src + config.css.watch, ['less']);
});