define(["underscore", "graphics/pixelcanvas", "util/encoder"],
  function (_, PixelCanvas, Encoder) {


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


    // paint draws the top most colored in layer for each pixel to the 
    // PixelCanvas
    LayeredCanvas.prototype.paint = function () {
      var pixels  = _.map(this.layers, function (v,k) {
        var coord = Encoder.scalarToCoord(k, this.dim);
        return { x: coord.x, y: coord.y, color: _.last(v) };
      }, this);

      this.layers = Object.create(null);

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
      var scalar = Encoder.coordToScalar(coord, this.dim);

      this.layers[scalar] = this.layers[scalar] || [];
      this.layers[scalar][layer] = color;
    };

    return LayeredCanvas;
  }
);
