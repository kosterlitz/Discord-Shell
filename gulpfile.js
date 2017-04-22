const gulp = require('gulp');
const babel = require('gulp-babel');
const PATH = 'src/*.js';
const BUILD = 'build';

gulp.task('build', () => {
    gulp.src(PATH)
        .pipe(babel({ presets: ['env'] }))
        .pipe(gulp.dest(BUILD));
});

gulp.task('watch', ['build'], () => {
    gulp.watch(PATH, ['build']);
});

gulp.task('default', ['watch']);