#!/usr/bin/env node

var fs = require('fs');
var _ = require('underscore');


// reflect flips the pixel image described in a given dimension about the center
// of the dimension for the image
//
// Arguments:
//   dimension: reflect over either 'x' or 'y' dimensions
//   pixels: array of objects with 'x', 'y' and 'color' fields
// Returns:
//   An array of pixel objects with dimension coordinates reflected about the
//   center
function reflect (dimension, pixels) {
  var bounds = _.reduce(pixels, function (b, p) {
    if (p[dimension] < b.min) b.min = p[dimension];
    if (p[dimension] > b.max) b.max = p[dimension];
    return b;
  }, { min: Infinity, max: -Infinity });

  return _.map(pixels, function (p) {
    var rp = _.clone(p);
    rp[dimension] = bounds.max - p[dimension] + bounds.min;
    return rp;
  });
}


// reflectSprite loads a sprite from disk, reflects it about the center of the
// given dimension, and outputs the result to disk
//
// Arguments:
//   dimension: reflect over either 'x' or 'y' dimensions
//   inputFile: filename of JSON sprite to load
//   outputFile: filename to save JSON sprite
function reflectSprite (dimension, inputFile, outputFile) {
  var sprite = JSON.parse(fs.readFileSync(inputFile, { encoding: 'utf8' }));
  sprite.pixels = reflect(dimension, sprite.pixels);
  fs.writeFileSync(outputFile, JSON.stringify(sprite));
}


// print usage to command line and exit with code
function usage (exitcode) {
  console.log('reflect.js:');
  console.log('Reflects a JSON sprite about the center of a given axis');
  console.log('Usage:');
  console.log('reflect.js <input file> <output file> <dimension>');
  console.log('Dimension may be either "x" or "y"');
  process.exit(exitcode);
}


if (process.argv.length !== 5) usage(1);
reflectSprite(process.argv[4], process.argv[2], process.argv[3]);
