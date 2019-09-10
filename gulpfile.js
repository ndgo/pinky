"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var rimraf = require('rimraf'); //очистка
var imagemin = require('gulp-imagemin'); //минимизация изображений
var sourcemaps = require('gulp-sourcemaps'); //sourcemaps
var uglify = require('gulp-uglify'); //минификация js
var rename = require("gulp-rename"); //переименвоание файлов
var cssmin = require('gulp-minify-css'); //минификация css
var runSequence = require('run-sequence');
var svgmin = require('gulp-svgmin');
var svgstore = require('gulp-svgstore');

var path = {
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'build/',
    serverRoot: './build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/img/',
    fonts: 'build/fonts/',
    svgSprite: 'build/img/'
  },
  src: { //Пути откуда брать исходники
    html: './*.html', //Синтаксис src/template/*.html говорит gulp что мы хотим взять все файлы с расширением .html
    js: './js/*.js',//В стилях и скриптах нам понадобятся только main файлы
    css: './sass/style.scss',
    img: './img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    fonts: './fonts/*.*',
    svg: './img/**/*.svg'
  },
  watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
    html: './*.html',
    js: './js/**/*.js',
    sass: './sass/**/*.scss',
    img: './img/**/*.*',
    fonts: './fonts/**/*.*'
  },
  clean: './build', //директории которые могут очищаться
  outputDir: './build' //исходная корневая директория для запуска минисервера
};

gulp.task("style", function () {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({
        browsers: [
          "last 2 versions"
        ]
      })
    ]))
    .pipe(gulp.dest("css"))
    .pipe(server.stream());
});

gulp.task("serve", ["style"], function () {
  server.init({
    server: ".",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
});

// чистим папку билда
gulp.task('clean', function (cb) {
  return rimraf(path.clean, cb);
});

// билдим статичные изображения
gulp.task('image:build', function () {
  return gulp.src(path.src.img) //Выберем наши картинки
    .pipe(imagemin(
      [
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({plugins: [{removeViewBox: true}]})
      ]
    ))
    .pipe(gulp.dest(path.build.img)) //выгрузим в build
    .pipe(server.reload({stream: true}));
});

// копируем статичные изображения
gulp.task('image:copy', function () {
  return gulp.src(path.src.img) //Выберем наши картинки
    .pipe(gulp.dest(path.build.img)) //выгрузим в build
    .pipe(server.reload({stream: true}));
});

// таск для билдинга html
gulp.task('html:build', function () {
  return gulp.src(path.src.html) //Выберем файлы по нужному пути
    .pipe(gulp.dest(path.build.html)) //выгрузим их в папку build
    .pipe(server.reload({stream: true}));
});

// билдинг яваскрипта
gulp.task('js:build', function () {
  return gulp.src(path.src.js) //Найдем наш main файл
    .pipe(sourcemaps.init()) //Инициализируем sourcemap
    .pipe(uglify()) //Сожмем наш js
    .pipe(sourcemaps.write()) //Пропишем карты
    // .pipe(rename({suffix: '.min'})) //добавим суффикс .min к выходному файлу
    .pipe(gulp.dest(path.build.js)) //выгрузим готовый файл в build
    .pipe(server.reload({stream: true}));
});

// билдинг домашнего css
gulp.task('css:build', function () {
  return gulp.src(path.src.css) //Выберем наш основной файл стилей
    .pipe(sourcemaps.init()) //инициализируем soucemap
    .pipe(sass()) //Скомпилируем sass
    .pipe(postcss([
      autoprefixer({
        browsers: [
          "last 2 versions"
        ]
      })
    ])) //Добавим вендорные префиксы
    .pipe(cssmin()) //Сожмем
    .pipe(sourcemaps.write()) //пропишем sourcemap
    // .pipe(rename({suffix: '.min'})) //добавим суффикс .min к имени выходного файла
    .pipe(gulp.dest(path.build.css)) //вызгрузим в build
    .pipe(server.reload({stream: true}));
});

// билдим шрифты
gulp.task('fonts:build', function () {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts)) //выгружаем в build
    .pipe(server.reload({stream: true}));
});

// билдим все
gulp.task('build', function (callback) {
  runSequence('clean', ['image:build', 'html:build', 'js:build', 'css:build', 'fonts:build', 'symbols:build'], callback);
});

// билдим все
gulp.task('buildForDevelop', function (callback) {
  runSequence('clean', ['image:copy', 'html:build', 'js:build', 'css:build', 'fonts:build'], callback);
});

gulp.task("watcher", ["buildForDevelop"], function () {
  gulp.watch(path.watch.img, ['image:copy']);
  gulp.watch(path.watch.html, ['html:build']);
  gulp.watch(path.watch.js, ['js:build']);
  gulp.watch(path.watch.sass, ['css:build']);
  gulp.watch(path.watch.fonts, ['fonts:build']);
});

gulp.task('browserSync', function () {
  server.init({
    server: path.build.serverRoot,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
});

gulp.task("symbols:build", function () {
  return gulp.src(path.src.svg)
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest(path.build.svgSprite));
});


gulp.task('default', function (callback) {
  runSequence('watcher', 'browserSync', callback)
});
