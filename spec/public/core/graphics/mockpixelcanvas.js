var requirejs = require('requirejs');
var _ = require('underscore');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var Color = requirejs('core/graphics/color');
var Encoder = requirejs('core/util/encoder');
var Frame = requirejs('core/util/frame');

// MockPixelCanvas object imitates a PixelCanvas object, but rather than
// render the pixels drawn the the screen the MockPixelCanvas just tracks
// what pixels have been set when.
var MockPixelCanvas = function (dimensions, backgroundColor) {
  Frame.call(this, dimensions, { x: 0, y: 0 });
  this.backgroundColor = Color.sanitize(backgroundColor);
  this.clear();
};
MockPixelCanvas.prototype = Object.create(Frame.prototype);
MockPixelCanvas.prototype.constructor = MockPixelCanvas;


// clear the mock canvas
MockPixelCanvas.prototype.clear = function () {
  this.renderedPixels = Object.create(null);
};


// getCanvasId returns null by default, should be contextually mocked
MockPixelCanvas.prototype.getCanvasID = function () {
  return null;
};


// getPixel returns the color of the meta-pixel at location x,y
//
// Arguments:
//   x: x position of the pixel in the grid from left most (0) to right
//      most (+ width)
//   y: y position of the pixel in the grid from top most (0) to bottom
//      most (+ height)
//
// Returns:
//   A color hexadecimal string in the format "#RRGGBB"
MockPixelCanvas.prototype.getPixel = function (x, y) {
  var scalar = Encoder.coordToScalar({ x: x, y: y }, this.getDimensions());
  return this.renderedPixels[scalar] || this.backgroundColor;
};


// getRenderedPixels is a mock specific method which returns all pixels that
// were set on the mock canvas since last clear/paint/resize/setBackground
//
// Returns array of pixels
MockPixelCanvas.prototype.getRenderedPixels = function () {
  return _.values(this.renderedPixels);
};

// paint clears rendered pixels
MockPixelCanvas.prototype.paint = function () {
  this.renderedPixels = Object.create(null);
};


// resize the pixel canvas to have given width and height in macro pixels
//
// Arguments:
//   dimensions: object with 'width' and 'height' fields
MockPixelCanvas.prototype.resize = function (dimensions) {
  Frame.prototype.resize.call(this, dimensions);
  this.renderedPixels = Object.create(null);
};


// screenParams returns null by default, should be mocked on a case by case
// basis
MockPixelCanvas.prototype.screenParams = function () {
  return null;
};


// setBackgroundColor sets the default color for the mock canvas
MockPixelCanvas.prototype.setBackgroundColor = function (backgroundColor) {
  this.backgroundColor = Color.sanitize(backgroundColor);
  this.resize(this.getDimensions);
};


// setPixel colors in the meta-pixel at location (x,y) with given color 
// within the meta-pixel buffer
//
// Arguments:
//   x: x position of the pixel in the grid from left most (0) to right
//      most (+ width)
//   y: y position of the pixel in the grid from top most (0) to bottom
//      most (+ height)
//   color: A hexadecimal string in the format "#RRGGBB"
MockPixelCanvas.prototype.setPixel = function (x, y, color) {
  var scalar = Encoder.coordToScalar({ x: x, y: y }, this.getDimensions());
  this.renderedPixels[scalar] = { x: x, y: y, color: Color.sanitize(color) };
};


module.exports = MockPixelCanvas;
