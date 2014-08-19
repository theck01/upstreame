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

// MockEditableCanvas object imitates a PixelCanvas object, but rather than
// render the pixels drawn the the screen the MockEditableCanvas just tracks
// what pixels have been set when.
var MockEditableCanvas = function (dimensions, backgroundColor) {
  Frame.call(this, dimensions, { x: 0, y: 0 });
  this.backgroundColor = Color.sanitize(backgroundColor);
  this.pixelsToRender = Object.create(null);
  this.renderedPixels = Object.create(null);
};
MockEditableCanvas.prototype = Object.create(Frame.prototype);
MockEditableCanvas.prototype.constructor = MockEditableCanvas;


// clear the mock canvas
MockEditableCanvas.prototype.clear = function () {
  this.renderedPixels = Object.create(null);
};


// doesRequireRedraw always returns true for tests.
MockEditableCanvas.prototype.doesRequireRedraw = function () {
  return true;
};


// getCanvasId returns null by default, should be contextually mocked
MockEditableCanvas.prototype.getCanvasID = function () {
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
MockEditableCanvas.prototype.getPixel = function (x, y) {
  var scalar = Encoder.coordToScalar({ x: x, y: y }, this.getDimensions());
  return this.pixelsToRender[scalar] || this.backgroundColor;
};


// getRenderedPixels is a mock specific method which returns all pixels that
// were set on the mock canvas since last clear/paint/resize/setBackground
//
// Returns array of pixels
MockEditableCanvas.prototype.getRenderedPixels = function () {
  return _.values(this.renderedPixels);
};


// paint clears rendered pixels
MockEditableCanvas.prototype.paint = function () {
  this.renderedPixels = this.pixelsToRender;
  this.pixelsToRender = Object.create(null);
};


// markForRedraw is the same as redraw for mock canvas
MockEditableCanvas.prototype.markForRedraw = MockEditableCanvas.prototype.paint;


// resize the pixel canvas to have given width and height in macro pixels
//
// Arguments:
//   dimensions: object with 'width' and 'height' fields
MockEditableCanvas.prototype.resize = function (dimensions) {
  Frame.prototype.resize.call(this, dimensions);
  this.pixelsToRender = Object.create(null);
  this.renderedPixels = Object.create(null);
};


// screenParams returns null by default, should be mocked on a case by case
// basis
MockEditableCanvas.prototype.screenParams = function () {
  return null;
};


// setBackgroundColor sets the default color for the mock canvas
MockEditableCanvas.prototype.setBackgroundColor = function (backgroundColor) {
  this.backgroundColor = Color.sanitize(backgroundColor);
  this.resize(this.getDimensions());
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
MockEditableCanvas.prototype.setPixel = function (x, y, color) {
  var scalar = Encoder.coordToScalar({ x: x, y: y }, this.getDimensions());
  this.pixelsToRender[scalar] = { x: x, y: y, color: Color.sanitize(color) };
};


module.exports = MockEditableCanvas;
