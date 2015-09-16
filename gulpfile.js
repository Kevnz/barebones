const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

const inherit = require('rework-inherit');
const vars = require('rework-vars');
const imprt = require('rework-import');
const reworkNPM = require('rework-npm');
const color = require('rework-color-function');

const browserify  = require('browserify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');


const beep = require('beepbeep');


gulp.task('lint', function () {
    return gulp.src(['./src/js/**/*.js'])
        .pipe(plugins.plumber({errorHandler: plugins.notify.onError("Lint Error")}))
        // eslint() attaches the lint output to the eslint property
        // of the file object so it can be used by other modules.
        .pipe(plugins.eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(plugins.eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failOnError last.
        .pipe(plugins.eslint.failOnError())
        .pipe(plugins.notify("The Lint Task is finished"))
});

gulp.task('js', ['lint'], () => {
 
    return browserify({ entries:['./src/js/index.js'], debug: true })
        .transform(babelify.configure({
          stage: 0
        }))
        .bundle()
        .on('error', (e) => {
            console.log('browserify error');
            //console.log(arguments);
            throw e;
        })
        .pipe(source('index.js'))
        .pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
        .pipe(gulp.dest('./dist/js')) 
        .pipe(plugins.livereload())
        .pipe(plugins.notify("The JS Task is finished"))
        .on('end', function () {
            console.log('ended');
            beep();
        });
});

gulp.task('css', () => {
    return gulp.src('./src/css/main.css')
        .pipe(plugins.plumber({errorHandler: plugins.notify.onError("Error: <%= error.message %>")}))
        .pipe(plugins.rework(reworkNPM({
            alias: { 'responsive-grids': './node_modules/purecss/build/grids-responsive.css' },
            shim: { 
                'purecss': 'build/pure.css',
                'purecss/grids-responsive': 'build/grids-responsive.css',
                'font-awesome' : 'css/font-awesome.css'
            }}),
            vars(), 
            color,
            inherit(),
            imprt({
                path: './css/modules/'
            }),
            { sourcemap: true}
            )
        )
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css/'))
        .pipe(plugins.livereload())
        .pipe(plugins.notify("The CSS Task is finished"));
});

gulp.task('build', ['css', 'js'])

gulp.task('watch', () => {
    plugins.livereload.listen({port:35739});
    gulp.watch(['./src/css/*.css','./src/css/**/**.css'], ['css']);
    gulp.watch(['./src/js/**.js','./src/js/**/*.js'], ['js']);

});