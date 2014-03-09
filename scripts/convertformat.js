#!/usr/bin/env node

var fs = require('fs');
var requirejs = require('requirejs');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

// print usage to command line and exit with code
function usage (exitcode) {
  console.log('convertformat.js:');
  console.log('Convert a data model to an alternate format');
  console.log('Usage:');
  console.log('reflect.js <input file> <output file> ' +
              '<from common model converter module> ' +
              '[<to common model converter module>]');
  process.exit(exitcode);
}


if (process.argv.length !== 5 && process.argv.length !== 6) usage(1);

var fromCommonConverter = requirejs(process.argv[4]);
var toCommonConverter = requirejs('core/model/converters/identityconverter');
if (process.argv.length === 6) toCommonConverter = requirejs(process.argv[5]);

var rawModel = fs.readFileSync(process.argv[2], { encoding: 'utf8' });
var model = JSON.parse(rawModel);
var commonModel = toCommonConverter.toCommonModelFormat(model);
var convertedModel = fromCommonConverter.fromCommonModelFormat(commonModel);

fs.writeFileSync(process.argv[3], JSON.stringify(convertedModel));

process.exit(0);
