"use strict";
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

const targetFile = "public/";
const tscCompilerSettings = {
	"target": 'es2020',
	"module": "es2020",
	"moduleResolution": "node"
};
const htmlMinifierSettings = {
	collapseWhitespace: true,
	removeComments: true,
	minifyCSS: true,
	minifyJS: true
};
const cssMinifierSettings = {};
const minifyJSON = through.obj(function (file, enc, cb) {
	try {
		let jsonVal = JSON.parse(file.contents.toString(enc));
		file.contents = Buffer.from(JSON.stringify(jsonVal, null, 0), enc);
		cb(null, file);
	} catch (error) {
		cb(error, file);
	}
});

function clean(cb){
	del(['./public/**'], cb);
}

function ts(cb){
	return src(["src/**/*.ts"],"src/").pipe(tsc(tscCompilerSettings)).pipe(uglify()).pipe(dest(targetFile));
}

function html(cb){
	return src("src/**/*.html","src/").pipe(minHtml(htmlMinifierSettings)).pipe(dest(targetFile));
}

function css(cb){
	return src("src/**/*.css","src/").pipe(minCss(cssMinifierSettings)).pipe(dest(targetFile));
}

function json(cb){
	return src("src/**/*.json","src/").pipe( minifyJSON).pipe(dest(targetFile));
}

function js(cb){
	return src(["src/**/*.js"],"src/").pipe(babel()).pipe(uglify()).pipe(dest(targetFile));
}

function ts_dev(cb){
	return src(["src/**/*.ts"],"src/").pipe(tsc(tscCompilerSettings)).pipe(dest(targetFile));
}

function html_dev(cb){
	return src("src/**/*.html","src/").pipe(dest(targetFile));
}

function css_dev(cb){
	return src("src/**/*.css","src/").pipe(dest(targetFile));
}

function json_dev(cb){
	return src("src/**/*.json","src/").pipe(dest(targetFile));
}

function js_dev(cb){
	return src(["src/**/*.js"],"src/").pipe(babel()).pipe(dest(targetFile));
}

function static_files(cb){
	return src(["src/**/*.png","src/**/*.jpeg","src/**/*.jpg","src/**/*.svg"],"src/").pipe(dest(targetFile));
}

const build = series( clean, parallel(html,js,ts,css,json,static_files));

const buildDev = series( clean, parallel(html_dev,js_dev,ts_dev,css_dev,json_dev,static_files));

exports.clean = clean;
exports.build = build;
exports.buildDev= buildDev;
exports.default = build;