const { src, dest, parallel, series } = require('gulp');
const gulp = require('gulp');
const del = require('delete');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const tsc = require('gulp-typescript');
const minHtml = require('gulp-htmlmin');
const minCss = require('gulp-clean-css');
const through = require('through2');
//const sass = require('gulp-sass');

function clean(cb){
	del(['./public/**'], cb);
}

function ts(cb){
	return src(["src/**/*.ts"],"src/").pipe(tsc({"target":'es2020',"module":"es2020","moduleResolution":"node"})).pipe(uglify()).pipe(dest("public/"));
}

function html(cb){
	return src("src/**/*.html","src/").pipe(minHtml({collapseWhitespace: true,removeComments: true,minifyCSS: true,minifyJS: true})).pipe(dest("public/"));
}

function css(cb){
	return src("src/**/*.css","src/").pipe(minCss({})).pipe(dest("public/"));
}

function json(cb){
	return src("src/**/*.json","src/").pipe( through.obj(function (file, enc, cb) {
			try {
				var jsonVal = JSON.parse(file.contents.toString(enc));
				file.contents = Buffer.from(JSON.stringify(jsonVal, null, 0), enc);
				cb(null, file);
			} catch (error) {
				cb(error, file);
			}
		})
	).pipe(dest("public/"));
}

function js(cb){
	return src(["src/**/*.js"],"src/").pipe(babel()).pipe(uglify()).pipe(dest("public/"));
}

function ts_dev(cb){
	return src(["src/**/*.ts"],"src/").pipe(tsc({"target":'es2020',"module":"es2020","moduleResolution":"node"})).pipe(dest("public/"));
}

function html_dev(cb){
	return src("src/**/*.html","src/").pipe(dest("public/"));
}

function css_dev(cb){
	return src("src/**/*.css","src/").pipe(dest("public/"));
}

function json_dev(cb){
	return src("src/**/*.json","src/").pipe(dest("public/"));
}

function js_dev(cb){
	return src(["src/**/*.js"],"src/").pipe(babel()).pipe(dest("public/"));
}

function static_files(cb){
	return src(["src/**/*.png","src/**/*.jpeg","src/**/*.jpg","src/**/*.svg"],"src/").pipe(dest("public/"));
}

const build = series( clean, parallel(html,js,ts,css,json,static_files));

const buildDev = series( clean, parallel(html_dev,js_dev,ts_dev,css_dev,json_dev,static_files));

exports.clean = clean;
exports.build = build;
exports.buildDev= buildDev;
exports.default = build;