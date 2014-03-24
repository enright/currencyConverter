'use strict';

var fs = require('fs'),
    uuid = require('node-uuid'),
    request = require('request');

module.exports = function(fromFile, conversionFilePath, webServiceURL) {

    var conversions,
        exportedConverter;
        
    // we presume we may not be provided a conversion file path
    function initConversions(conversionFilePath) {
        // read sync because we really can't be ready until we've set this up
        var fileContents = fs.readFileSync(conversionFilePath, { encoding: 'utf8' }),
            lines = fileContents.split('\n'),
            lineCount = lines.length,
            i,
            regex = /([^=]*)=(.) (.*)/,
            parts,
            conversions = {};
        for (i = 0; i < lineCount; i += 1) {
            parts = lines[i].match(regex);
            if (parts) {
                conversions[parts[1]] = { 'symbol': parts[2], 'exchange': parts[3] };
            }
        }
        //console.log('initial conversions ', conversions);
        return conversions;
    }

    function writeConversions(conversions) {
        // write to a temp file
        var tempFilePath = conversionFilePath.match(/(.*\/)[^\/]+$/)[1],
            tempfile = tempFilePath + uuid.v4(),
            content = '',
            conversion;

        // use uuid
        // then rename synch
        // maybe an issue here with multiple simultaneous writes...but presume ok
        for (conversion in conversions) {
            if (conversions.hasOwnProperty(conversion)) {
                content += conversion + '=' + conversions[conversion].symbol + ' ' +
                        conversions[conversion].exchange + '\n';
            }
        }

        fs.writeFile(tempfile, content, function (err) {
            // unlink could fail?
            if (!err) {
                fs.unlinkSync(conversionFilePath);
                fs.renameSync(tempfile, conversionFilePath);
            }
        });
    }

    function getLatestConversionRates(callback) {
        request({ url: webServiceURL, json: true }, function(error, res, body) {
            var conversion;
            if (!error && res.statusCode === 200) {
                for (conversion in conversions) {
                    if (conversions.hasOwnProperty(conversion)) {
                        if (body.rates[conversion]) {
                            conversions[conversion].exchange = body.rates[conversion];
                        }
                    }
                }
                writeConversions(conversions);
            }
            callback();
        });
    }
    
    // does not round
    // undefined if cannot convert
    function toUSD(from, amount) {
        // get factor for from
        var factor = conversions[from] && conversions[from].exchange,
            usd;
        if (factor) {
            usd = amount / factor;
        }
        return usd;
    }
    
    function fromUSD(to, amount) {
        var factor = conversions[to] && conversions[to].exchange,
            toCurrency;
        if (factor) {
            toCurrency = factor * amount;
        }
        return toCurrency;
    }
    
    // round to two decimals
    function round2Decimals(amount) {
        return Math.floor(Math.round(amount * 100)) / 100;
    }

    function convert(from, to, amount, callback) {
        // first convert to USD
        var inUSD = toUSD(from, amount),
            inOther;

        // if successful conversion, then convert to other currency
        if (inUSD) {
            inOther = fromUSD(to, inUSD);
            if (inOther) {
                inOther = round2Decimals(inOther);
            }
        }
        
        // if we converted, send back the result
        if (inOther) {
            callback(false, { symbol: conversions[to].symbol, amount: inOther });
        } else { // otherwise send an error
            callback('no conversion available', undefined);
        }
    }

    // we can't init without the file existing
    if (!fs.existsSync(conversionFilePath)) {
        return undefined;
    }
        
    // always read the conversions initially
    // so that there is a default in case ws calls fail
    conversions = initConversions(conversionFilePath);
    
    // if fromFile, then we don't hit the web service, we just convert
    exportedConverter = convert;
    
    // if we're using the web service
    if (!fromFile && webServiceURL) {
        exportedConverter = function (from, to, amount, callback) {
            // get the currency conversion (pass in current known as default)
            getLatestConversionRates(function () {
                convert(from, to, amount, callback);
            });
        };
    }
    
    return exportedConverter;
};