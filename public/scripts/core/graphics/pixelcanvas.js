define(["jquery", "underscore", "core/graphics/color", "core/util/frame"],
  function ($, _, Color, Frame) {

    // makePixelGrid creates a 2D array with given dimensions containin an RGB
    // string at each location in the array
    //
    // Arguments:
    //   width: width of the pixel canvas in meta-pixels
    //   height: height of the pixel canvas in meta-pixels
    //   color: default color of pixels not drawn to, "#RRGGBB" string. If
    //          undefined the pixels not drawn to are transparent
    function makePixelGrid (width, height, color) {
      var ary = [];

      for(var i=0; i<width; i++){
        ary[i] = [];
        for(var j=0; j<height; j++){
          ary[i][j] = color;
        }
      }
      
      return ary;
    }


    // clearPixelGrid clears a 2D color array to contain only the given color
    // color
    //
    // Arguments:
    //   grid: existing pixel grid
    //   color: default color of pixels not drawn to, "#RRGGBB" string. If
    //          undefined the pixels not drawn to are transparent
    function clearPixelGrid (grid, color) {
      var ary = [];

      for(var i=0; i<grid.length; i++){
        for(var j=0; j<grid[i].length; j++){
          grid[i][j] = color;
        }
      }
      
      return ary;
    }



    // diffFrames returns the change between the current pixel grid and the
    // previous pixel grid, for efficent drawing
    //
    // Arguments:
    //   present: current pixel grid
    //   past: previous pixel grid. Optional, if unspecified then present is
    //         compared to a completely empty grid
    //
    // Returns:
    //   A map of color strings (or "transparent") to x,y pairs, indicating
    //   pixel values that have changed between past and present
    function diffFrames (present, past) {
      var i,j;
      var color;
      var diff = Object.create(null);

      for (i=0; i<present.length; i++) {
        for (j=0; j < present[i].length; j++) {
          if (!past || present[i][j] !== past[i][j]) {
            color = present[i][j] || "transparent";
            diff[color] = diff[color] || [];
            diff[color].push({ x: i, y: j });
          }
        }
      }
      return diff;
    }


    // PixelCanvas object abstracts the HTML canvas object and exposes an API to
    // draw meta-pixels on the canvas. Clears the canvas on creation
    //
    // Constructor Arguments:
    //   dimensions: object with 'width' and 'height' fields
    //   canvasID: css selector style id of the canvas on the page
    //   backgroundColor: default color of pixels not drawn to, "#RRGGBB" string
    //                    Optional, default is undefined (transparent)
    var PixelCanvas = function (dimensions, canvasID, backgroundColor) {
      Frame.call(this, dimensions, { x: 0, y: 0 });

      this.dim = _.clone(dimensions);
      if (backgroundColor) {
        this.backgroundColor = Color.sanitize(backgroundColor);
      }
      else this.backgroundColor = undefined;
      this.pastBuffer = makePixelGrid(this.dim.width, this.dim.height,
                                      undefined);
      this.pixelBuffer = makePixelGrid(this.dim.width, this.dim.height,
                                       this.backgroundColor);
      this.htmlCanvas = $(canvasID)[0];
      this.cachedCanvasDim = Object.create(null);
    };
    PixelCanvas.prototype = Object.create(Frame.prototype);
    PixelCanvas.prototype.constructor = PixelCanvas;


    // clear the canvas
    PixelCanvas.prototype.clear = function () {
      var context = this.htmlCanvas.getContext("2d");
      context.clearRect(0, 0, this.htmlCanvas.width, this.htmlCanvas.height);
      this.pastBuffer = makePixelGrid(this.dim.width, this.dim.height,
                                      undefined);
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

      // if the canvas has been resized, clear it as everthing must be redrawn
      if (this.htmlCanvas.width !== this.cachedCanvasDim.width ||
          this.htmlCanvas.height !== this.cachedCanvasDim.height) {
        this.clear();
        this.cachedCanvasDim = { width: this.htmlCanvas.width,
                                 height: this.htmlCanvas.height };
      }

      var diff = diffFrames(this.pixelBuffer, this.pastBuffer);
      var sparams = this.screenParams();
      var x, y;

      _.each(diff, function (pixels, color) {
        if (color === "transparent") {
          _.each(pixels, function (p) {
            x = sparams.xoffset + p.x*sparams.pixelSize;
            y = sparams.yoffset + p.y*sparams.pixelSize;
            context.clearRect(x, y, sparams.pixelSize, sparams.pixelSize);
          });
        }
        else {
          context.fillStyle = color;
          _.each(pixels, function (p) {
            x = sparams.xoffset + p.x*sparams.pixelSize;
            y = sparams.yoffset + p.y*sparams.pixelSize;
            context.fillRect(x, y, sparams.pixelSize, sparams.pixelSize);
          });
        }
      });

      // reset grid to background color
      var tmp = this.pastBuffer;
      this.pastBuffer = this.pixelBuffer;
      this.pixelBuffer = tmp;
      clearPixelGrid(this.pixelBuffer, this.backgroundColor);
    };


    // screenParams measures current canvas dimensions and returns an object 
    // with the fields:
    //
    // Return fields:
    //   pixelSize: meta-pixel width and height in screen pixels
    //   xoffset: x offset in screen pixels of the left most pixels from the
    //            left edge of the canvas
    //   yoffset: yoffset in screen pixels of the top most pixels from the
    //            top most edge of the canvas
    PixelCanvas.prototype.screenParams = function () {

      var retval = Object.create(null);
      var height = this.htmlCanvas.height;
      var width = this.htmlCanvas.width;
      
      var xfactor = Math.floor(width/this.dim.width);
      var yfactor = Math.floor(height/this.dim.height);

      // meta-pixel dimensions determined by the smallest screen pixel to 
      // meta-pixel ratio, so that all pixels will fit on screen
      retval.pixelSize = xfactor < yfactor ? xfactor : yfactor;

      // compute offsets using computed pixelSize and number of pixels in each
      // dimension so that the canvas is centered
      retval.xoffset = Math.floor((width - retval.pixelSize*this.dim.width)/2);
      retval.yoffset = Math.floor((height -
                                   retval.pixelSize*this.dim.height)/2);

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
      if (x >= this.dim.width || x < 0 || y >= this.dim.height || y < 0) return;
      this.pixelBuffer[x][y] = Color.sanitize(color);
    };

    return PixelCanvas;
  }
);
