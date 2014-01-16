#!/usr/bin/env node

var fs = require('fs');
var _ = require('underscore');
var requirejs = require('requirejs');

requirejs.config({
  baseUrl: __dirname + '/../public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var Sprite = requirejs('core/graphics/sprite');

// Reduce an area on the pixel grid to a single color
//
// Arguments:
//   pixelGrid: 2D array of pixels being reduced
//   position: Object with 'x' and 'y' fields, where reduction is occuring
//   factor: integer, number of pixels in width and height to reduce to a single
//           color
//
// Returns the color string for the given area
function reduceArea (pixelGrid, position, factor) {
  var colorCounts = Object.create(null);
  var startOffset = -1 * Math.ceil(factor/2) + 1;
  var endOffset = Math.floor(factor/2);

  for (var i=position.x+startOffset; i<position.x+endOffset; i++) {
    for (var j=position.y+startOffset; j<position.y+endOffset; j++) {
      // check that position is within grid
      if (i > pixelGrid.length || i < 0 || j > pixelGrid[0].length || j < 0) {
        continue;
      }
      
      if (!pixelGrid[i][j]) continue;
      var color = pixelGrid[i][j].color;
      if (color === undefined) continue;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  }


  var colorPairs = _.pairs(colorCounts);
  if (colorPairs.length === 0) return undefined;
  colorPairs = _.sortBy(colorPairs, function (p) {
    return -p[1];
  });

  var positionColor = pixelGrid[position.x][position.y].color;
  if (colorCounts[positionColor] === colorPairs[0][1]) return positionColor;
  else return colorPairs[0][0];
}


// Function generates a 2D array filled with undefined
//
// Arguments:
//   dimensions: Object with 'width' and 'height' fields
//
// Returns an array of width lenght, containing arrays of height length
function make2DArray (dimensions) {
  var ary = new Array(dimensions.width);
  for (var i=0; i<dimensions.width; i++) ary[i] = new Array(dimensions.height);
  return ary;
}


// Function loads a sprite from a file, downsizes it, and writes the result
// to a file
//
// Arguments:
//    input: input filename
//    output: output filename
//    factor: factor of sprite reduction
function downsize (input, output, factor) {
  var spriteObj = JSON.parse(fs.readFileSync(input, { encoding: 'utf8' }));
  var sprite = new Sprite(spriteObj.pixels);
  var bounds = sprite.bounds();

  var dimensions = { width: bounds.xmax - bounds.xmin + 1,
                     height: bounds.ymax - bounds.ymin + 1 };
  var grid = make2DArray(dimensions);

  _.each(spriteObj.pixels, function (p) {
    console.log(JSON.stringify(p));
    console.log(JSON.stringify(bounds));
    console.log(grid.length);
    console.log(grid[p.x - bounds.xmin].length);
    grid[p.x - bounds.xmin][p.y - bounds.ymin] = p;
  });

  var sums = { x: 0, y: 0 };
  var downsizedPixels = [];
  for (var i=0; i<dimensions.width; i+=factor) {
    for (var j=0; j<dimensions.height; j+=factor) {
      var p = { x: Math.floor(i/factor) + bounds.xmin,
                y: Math.floor(j/factor) + bounds.ymin,
                color: reduceArea(grid, { x: i, y: j }, factor) };
      if (p.color) {
        downsizedPixels.push(p);
        sums.x += p.x;
        sums.y += p.y;
      }
    }
  }

  spriteObj.pixels = downsizedPixels;
  spriteObj.center.x = sums.x/downsizedPixels.length;
  spriteObj.center.y = sums.y/downsizedPixels.length;

  fs.writeFileSync(output, JSON.stringify(spriteObj));
}


// print usage to command line and exit with code
function usage (exitcode) {
  console.log('downsize.js:');
  console.log('Downsizes a sprite by downsampling with a given factor');
  console.log('Usage:');
  console.log('downsize.js <input file> <output file> <factor>');
  console.log('Factor must be a positive integer > 1');
  process.exit(exitcode);
}


if (process.argv.length !== 5) usage(1);
process.argv[4] = parseInt(process.argv[4]);
if (process.argv[4] <= 1 || Math.floor(process.argv[4]) !== process.argv[4]) {
  usage(1);
}
downsize(process.argv[2], process.argv[3], process.argv[4]);


