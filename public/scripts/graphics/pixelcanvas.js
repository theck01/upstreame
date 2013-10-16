define(["jquery", "underscore", "graphics/color"],
  function ($, _, Color) {

    // function creates a 2D array with given dimensions containin an RGB
    // string at each location in the array
    //
    // Arguments:
    //   width: width of the pixel grid
    //   height: height of the pixel grid
    //   color: default color of pixels not drawn to, "#RRGGBB" string
    function makePixelGrid(width, height, color) {
      var ary = [];
      var i, j;

      for(i=0; i<width; i++){
        ary[i] = [];
        for(j=0; j<height; j++){
          ary[i][j] = _.clone(color);
        }
      }
      
      return ary;
    }


    // PixelCanvas object abstracts the HTML canvas object and exposes an API to
    // draw meta-pixels on the canvas.
    //
    // Constructor Arguments:
    //   width: width of the pixel canvas in meta-pixels
    //   height: height of the pixel canvas in meta-pixels
    //   backgroundColor: default color of pixels not drawn to, "#RRGGBB" string
    //   canvasID: css selector style id of the canvas on the page
    var PixelCanvas = function (width, height, backgroundColor, canvasID) {
      this.dim = { width: width, height: height };
      this.backgroundColor = backgroundColor;
      this.pixelBuffer = makePixelGrid(this.dim.width, this.dim.height,
                                       this.backgroundColor);
      this.htmlCanvas = $(canvasID)[0];
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
    PixelCanvas.prototype.getPixel = function (x, y) {
      if(x > this.dim.width || x < 0 || y > this.dim.height || y < 0)
        return "#000000";
      return this.pixelBuffer[x][y];
    };


    // paint draws the pixel buffer to the HTML canvas and resets the buffer
    // to contain all white pixels
    PixelCanvas.prototype.paint = function () {

      var context = this.htmlCanvas.getContext("2d");
      var sparams = this.screenParams(this.dim.width, this.dim.height);
      var x, y;

      // clear the canvas
      context.clearRect(0,0,this.htmlCanvas.width,this.htmlCanvas.height);

      // draw each pixel individually
      _.each(this.pixelBuffer, function(column, i){
        _.each(column, function(color, j){
          x = sparams.xoffset + i*sparams.pixelSize;
          y = sparams.yoffset + j*sparams.pixelSize;
          context.fillStyle = color;
          context.fillRect(x,y,sparams.pixelSize,sparams.pixelSize);
        });
      });

      // reset grid to all white 
      this.pixelBuffer = makePixelGrid(this.dim.width, this.dim.height,
                                       this.backgroundColor);
    };


    // screenParams measures current canvas dimensions and returns an object 
    // with the fields:
    //
    // Arguments:
    //   pixelWidth: width of the pixelCanvas in meta-pixels
    //   pixelHeight: height of the pixelCanvas in meta-pixels
    //
    // Return fields:
    //   pixelSize: meta-pixel width and height in screen pixels
    //   xoffset: x offset in screen pixels of the left most pixels from the
    //            left edge of the canvas
    //   yoffset: yoffset in screen pixels of the top most pixels from the
    //            top most edge of the canvas
    PixelCanvas.prototype.screenParams = function (pixelWidth, pixelHeight) {
      var retval = {};

      var height = this.htmlCanvas.height;
      var width = this.htmlCanvas.width;
      
      var xfactor = Math.floor(width/pixelWidth);
      var yfactor = Math.floor(height/pixelHeight);

      // meta-pixel dimensions determined by the smallest screen pixel to 
      // meta-pixel ratio, so that all pixels will fit on screen
      retval.pixelSize = xfactor < yfactor ? xfactor : yfactor;

      // compute offsets using computed pixelSize and number of pixels in each
      // dimension so that the canvas is centered
      retval.xoffset = Math.floor((width - retval.pixelSize*pixelWidth)/2);
      retval.yoffset = Math.floor((height - retval.pixelSize*pixelHeight)/2);

      return retval;
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
    PixelCanvas.prototype.setPixel = function (x, y, color) {
      // dont write to buffer if location is outside canvas bounds
      if(x >= this.dim.width || x < 0 || y >= this.dim.height || y < 0)
        return;
      this.pixelBuffer[x][y] = Color.sanitize(color);
    };

    return PixelCanvas;
  }
);
