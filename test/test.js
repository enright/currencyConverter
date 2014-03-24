/* global describe: false */
/* global it: false */
/* jshint unused: false */
/* jshint expr: true */

'use strict';

var should = require('should');
var converter = require('../lib/currencyConverter');
var fs = require('fs');

describe('currency converter', function () {
	describe('create converter when conversion file does not exist', function () {
		fs.writeFileSync('test/xchange.data',
			fs.readFileSync('test/xchange.data.bkp', { encoding: 'utf8' }));
		it('returns undefined when not from file', function () {
			var currencyExchange = converter(false, 'moonInJune.$$$', 'www.dev.null/service');
			should(currencyExchange).be.equal(undefined);
		});
		it('returns undefined when from file', function () {
			var currencyExchange = converter(true, 'moonInJune.$$$', 'www.dev.null/service');
			should(currencyExchange).be.equal(undefined);
		});
	});
	describe('create converter when conversion file exists', function () {
		fs.writeFileSync('test/xchange.data',
			fs.readFileSync('test/xchange.data.bkp', { encoding: 'utf8' }));
		it('returns function when not from file', function () {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange.should.be.a.Function;
		});
		it('returns function when from file', function () {
			var currencyExchange = converter(true, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange.should.be.a.Function;
		});
	});
	describe('conversion without webservice', function () {
		fs.writeFileSync('test/xchange.data',
			fs.readFileSync('test/xchange.data.bkp', { encoding: 'utf8' }));
		it('does not matter if an existing url is specified', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data', 'www.dreezle.com');
			currencyExchange('USD', 'USD', 25.05, function (err, result) {
				result.amount.should.equal(25.05);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('does not matter if a url does not exist', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('USD', 'USD', 25.05, function (err, result) {
				result.amount.should.equal(25.05);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('does not matter if a url is null', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data', null);
			currencyExchange('USD', 'USD', 25.05, function (err, result) {
				result.amount.should.equal(25.05);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from USD to USD yielding same values', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data');
			currencyExchange('USD', 'USD', 25.05, function (err, result) {
				result.amount.should.equal(25.05);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from USD to USD with rounding', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data');
			currencyExchange('USD', 'USD', 25.057, function (err, result) {
				result.amount.should.equal(25.06);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from USD to CAD', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data');
			currencyExchange('USD', 'CAD', 25.05, function (err, result) {
				result.amount.should.equal(Math.floor(Math.round(25.05*1.10*100))/100);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from EUR to CAD', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data');
			currencyExchange('EUR', 'CAD', 1234.56, function (err, result) {
				var converted = 1234.56/0.74*1.10;
				result.amount.should.equal(Math.floor(Math.round(converted*100))/100);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from USD to EUR', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data');
			currencyExchange('USD', 'EUR', 1234.56, function (err, result) {
				var converted = 1234.56*0.74;
				result.amount.should.equal(Math.floor(Math.round(converted*100))/100);
				result.symbol.should.equal('€');
				done();
			});
		});
		it('fails to convert from EUR to XXX', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data');
			currencyExchange('EUR', 'XXX', 1234.56, function (err, result) {
				should(result).be.equal(undefined);
				done();
			});
		});
		it('fails to convert from XXX to CAD', function (done) {
			var currencyExchange = converter(true, 'test/xchange.data');
			currencyExchange('XXX', 'CAD', 1234.56, function (err, result) {
				should(result).be.equal(undefined);
				done();
			});
		});
	});
	describe('conversion with webservice (non existing URL)', function () {
		fs.writeFileSync('test/xchange.data',
			fs.readFileSync('test/xchange.data.bkp', { encoding: 'utf8' }));
		it('converts from USD to USD yielding same values', function (done) {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('USD', 'USD', 25.05, function (err, result) {
				result.amount.should.equal(25.05);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from USD to USD with rounding', function (done) {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('USD', 'USD', 25.057, function (err, result) {
				result.amount.should.equal(25.06);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from USD to CAD', function (done) {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('USD', 'CAD', 25.05, function (err, result) {
				result.amount.should.equal(Math.floor(Math.round(25.05*1.10*100))/100);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from EUR to CAD', function (done) {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('EUR', 'CAD', 1234.56, function (err, result) {
				var converted = 1234.56/0.74*1.10;
				result.amount.should.equal(Math.floor(Math.round(converted*100))/100);
				result.symbol.should.equal('$');
				done();
			});
		});
		it('converts from USD to EUR', function (done) {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('USD', 'EUR', 1234.56, function (err, result) {
				var converted = 1234.56*0.74;
				result.amount.should.equal(Math.floor(Math.round(converted*100))/100);
				result.symbol.should.equal('€');
				done();
			});
		});
		it('fails to convert from EUR to XXX', function (done) {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('EUR', 'XXX', 1234.56, function (err, result) {
				should(result).be.equal(undefined);
				done();
			});
		});
		it('fails to convert from XXX to CAD', function (done) {
			var currencyExchange = converter(false, 'test/xchange.data', 'www.dev.null/service');
			currencyExchange('XXX', 'CAD', 1234.56, function (err, result) {
				should(result).be.equal(undefined);
				done();
			});
		});
	});
	describe('conversion with working webservice', function () {
		it('converts from USD to USD yielding same values - updates xchange data', function (done) {
			var currencyExchange;
			fs.writeFileSync('test/xchange.data',
				fs.readFileSync('test/xchange.data.bkp', { encoding: 'utf8' }));
			currencyExchange = converter(false, 'test/xchange.data', 'http://openexchangerates.org/api/latest.json?app_id=58ae7feb73e64cf3b631fb5f1a6e463c');
			currencyExchange('USD', 'USD', 25.05, function (err, result) {
				result.amount.should.equal(25.05);
				// need to let file re-write complete sometimes...
				setTimeout(function () { done(); }, 500);
			});
		});
		it('converts from USD to USD with rounding', function (done) {
			var currencyExchange;
			fs.writeFileSync('test/xchange.data',
				fs.readFileSync('test/xchange.data.bkp', { encoding: 'utf8' }));
			currencyExchange = converter(false, 'test/xchange.data', 'http://openexchangerates.org/api/latest.json?app_id=58ae7feb73e64cf3b631fb5f1a6e463c');
			currencyExchange('USD', 'USD', 25.057, function (err, result) {
				result.amount.should.equal(25.06);
				done();
			});
		});
		it('converts from USD to CAD', function (done) {
			var currencyExchange;
			fs.writeFileSync('test/xchange.data',
				fs.readFileSync('test/xchange.data.silly', { encoding: 'utf8' }));
			currencyExchange = converter(false, 'test/xchange.data', 'http://openexchangerates.org/api/latest.json?app_id=58ae7feb73e64cf3b631fb5f1a6e463c');
			currencyExchange('USD', 'CAD', 25.05, function (err, result) {
				result.amount.should.not.equal(Math.floor(Math.round(25.05*0.02*100))/100);
				done();
			});
		});
		it('converts from EUR to CAD', function (done) {
			var currencyExchange;
			fs.writeFileSync('test/xchange.data',
				fs.readFileSync('test/xchange.data.silly', { encoding: 'utf8' }));
			currencyExchange = converter(false, 'test/xchange.data', 'http://openexchangerates.org/api/latest.json?app_id=58ae7feb73e64cf3b631fb5f1a6e463c');
			currencyExchange('EUR', 'CAD', 1234.56, function (err, result) {
				var converted = 1234.56/0.01*0.02;
				result.amount.should.not.equal(Math.floor(Math.round(converted*100))/100);
				done();
			});
		});
		it('updates the file', function (done) {
			var currencyExchange,
				originalContent = fs.readFileSync('test/xchange.data.bkp', { encoding: 'utf8' });
			fs.writeFileSync('test/xchange.data', originalContent);
			currencyExchange = converter(false, 'test/xchange.data', 'http://openexchangerates.org/api/latest.json?app_id=58ae7feb73e64cf3b631fb5f1a6e463c');
			currencyExchange('EUR', 'CAD', 1234.56, function (err, result) {
				var converted = 1234.56/0.01*0.02;
				result.amount.should.not.equal(Math.floor(Math.round(converted*100))/100);
				setTimeout(function () {
					var newContent = fs.readFileSync('test/xchange.data', { encoding: 'utf8' });
					//console.log('original ', originalContent);
					//console.log('new ', newContent);
					newContent.should.not.be.equal(originalContent);
					done();
				}, 500);
			});
		});
	});
});