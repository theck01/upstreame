define(["underscore", "graphics/pixelcanvas"], function (_, PixelCanvas) {


  // coordToScalar returns a scalar encoding of an (x,y) coordinate into a 
  // single scalar value
  //
  // Arguments:
  //   coord: An object with integer 'x' and 'y' fields
  //   dim: An object with integer 'width' and 'height' fields
  //
  // Return:
  //   A scalar value
  function coordToScalar (coord, dim) {
    return coord.x * dim.height + coord.y;
  }


  // scalarToCoord returns an (x,y) coordinate into generated from an encoded
  // scalar value
  //
  // Arguments:
  //   scalar: An object with integer 'x' and 'y' fields
  //   dim: An object with integer 'width' and 'height' fields
  //
  // Return:
  //   A coordinate object, with 'x' and 'y' fields:
  function scalarToCoord (scalar, dim) {
    return { x: Math.floor(scalar/dim.height), y: scalar%dim.height };
  }


  // LayeredCanvas object encapsulates a PixelCanvas element and gives it the
  // abstraction of having multiple layers on which to draw. On a paint call, 
  // only the topmost painted layer for each pixel is truely visible on the
  // PixelCanvas
  //
  // Constructor Arguments:
  //   width: width of the pixel canvas in meta-pixels
  //   height: height of the pixel canvas in meta-pixels
  //   backgroundColor: default color of pixels not drawn to, "#RRGGBB" string
  //   canvasID: css selector style id of the canvas on the page
  var LayeredCanvas = function (width, height, backgroundColor, canvasID) {
    this.dim = { width: width, height: height };
    this.layers = Object.create(null);
    this.pCanvas = new PixelCanvas(width, height, backgroundColor, canvasID);
  };


  // paint draws the top most colored in layer for each pixel to the PixelCanvas
  LayeredCanvas.prototype.paint = function () {
    var pixels  = _.map(this.layers, function (v,k) {
      var coord = scalarToCoord(k, this.dim);
      return { x: coord.x, y: coord.y, color: _.last(v) };
    }, this);

    _.each(pixels, function (p) {
      this.pCanvas.setPixel(p.x, p.y, p.color);
    }, this);

    this.pCanvas.paint();
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
  //   layer: A positive integer representing the layer at which the pixel
  //          should be drawn
  LayeredCanvas.prototype.setPixel = function (x, y, color, layer) {
    var coord = { x: x, y: y };
    var scalar = coordToScalar(coord, this.dim);

    this.layers[scalar] = this.layers[scalar] || [];
    this.layers[scalar][layer] = color;
  };
});
