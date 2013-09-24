define(["jquery", "underscore"], function ($,_) {
  var $htmlCanvas = $("#game-canvas");


  // function creates a 2D array with given dimensions containin an RGB tuple 
  // object at each location in the array
  //
  // Arguments:
  //   width: width of the pixel grid
  //   height: height of the pixel grid
  function makePixelGrid(width, height) {
    var ary = [];
    var i, j;

    for(i=0; i<width; i++){
      ary[i] = [];
      for(j=0; j<height; j++){
        ary[i][j] = { red: 0, green: 0, blue: 0 };
      }
    }
  }
  

  // function measures current canvas dimensions and returns an object with
  // the fields:
  //
  // Arguments:
  //   pixelWidth: width of the pixelCanvas in meta-pixels
  //   pixelHeight: height of the pixelCanvas in meta-pixels
  //
  // Return fields:
  //   size: meta-pixel width and height in screen pixels
  //   xoffset: x offset in screen pixels of the left most pixels from the left
  //            edge of the canvas
  //   yoffset: yoffset in screen pixels of the bottom most pixels from the 
  //            bottom most edge of the canvas
  function screenParams(pixelWidth, pixelHeight) {
    var retval = {};

    var height = $htmlCanvas.height();
    var width = $htmlCanvas.width();
    
    var xfactor = Math.floor(width/pixelWidth);
    var yfactor = Math.floor(height/pixelHeight);

    // meta-pixel dimensions determined by the smallest screen pixel to 
    // meta-pixel ratio, so that all pixels will fit on screen
    retval.size = xfactor < yfactor ? xfactor : yfactor;

    // compute offsets using computed size and number of pixels in each
    // dimension so that the canvas is centered
    retval.xoffset = Math.floor((width - retval.size*pixelWidth)/2);
    retval.yoffset = Math.floor((height - retval.size*pixelHeight)/2);

    return retval;
  }




  // pixelCanvas object abstracts the HTML canvas object and exposes an API to
  // draw meta-pixels on the canvas.
  //
  // Constructor Arguments:
  //   width: width of the pixel canvas in meta-pixels
  //   height: height of the pixel canvas in meta-pixels
  var pixelCanvas = function (width, height) {

    var dim = { width: width, height: height };
    var pixelBuffer = makePixelGrid(dim.width, dim.height);


    // drawPixel colors in the meta-pixel at location (x,y) with given color 
    // within the meta-pixel buffer
    //
    // Arguments:
    //   x: x position of the pixel in the grid from left most (0) to right most
    //      (+ width)
    //   y: y position of the pixel in the grid from bottom most (0) to top most
    //      (+ height)
    //   color: tuple containing fields for red, green, and blue 8 bit integer
    //          values
    this.drawPixel = function (x, y, color) {
      _.defaults(color, { red: 0, blue: 0, green: 0 });
      
      // dont write to buffer if location is outside canvas bounds
      if(x > dim.width || x < 0 || y > dim.height || y < 0) return;

      pixelBuffer[x][y] = { red: color.red, blue: color.blue,
                            green: color.green };
    };


    // paint draws the pixel buffer to the HTML canvas and resets the buffer
    // to contain all black pixels
    this.paint = function () {


      // reset grid to all black 
      pixelBuffer = makePixelGrid(dim.width, dim.height);
    };
  };

  return pixelCanvas;
});
