define(["jquery", "underscore"],
  function ($,_) {

    // PixelCanvas object abstracts the HTML canvas object and exposes an API to
    // draw meta-pixels on the canvas.
    //
    // Constructor Arguments:
    //   width: width of the pixel canvas in meta-pixels
    //   height: height of the pixel canvas in meta-pixels
    //   canvasID: css selector style id of the canvas on the page
    var PixelCanvas = function (width, height, canvasID) {

      var dim = { width: width, height: height };
      var pixelBuffer = makePixelGrid(dim.width, dim.height);
      var htmlCanvas = $(canvasID)[0];
      
      
      // hexColor sanitizes a color object and converts it to a hexadecimal
      // string in the format #RRGGBB
      // grid contain only valid color values
      // 
      // Arguments:
      //   color: A tuple containing an 8 bit value for red, green, and blue
      // 
      // Returns:
      //   A hexadecimal color string
      function hexColor(color) {
        var colorString = "#";
        var sanitizedColor = {};

        _.defaults(color, { red: 0, blue: 0, green: 0 });
        color = _.pick(color, ["red", "green", "blue"]);
        _.each(color, function(v,k) {
          sanitizedColor[k] = Math.min(Math.max(v,0), 255);
        });

        colorString += hexString(sanitizedColor.red);
        colorString += hexString(sanitizedColor.green);
        colorString += hexString(sanitizedColor.blue);
        return colorString;
      }


      // hexString takes an 8 bit number and converts it into a two character
      // hexadecimal string
      //
      // Argument:
      //   eightBit: An integer in range 0-255
      //
      // Returns:
      //   A two character hexadecimal string
      function hexString(eightBit){
        var str = eightBit.toString(16);
        if(str.length === 1){
          return "0" + str;
        }
        else return str;
      }


      // function creates a 2D array with given dimensions containin an RGB
      // string at each location in the array
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
            ary[i][j] = "#FFFFFF";
          }
        }
        
        return ary;
      }


      // paint draws the pixel buffer to the HTML canvas and resets the buffer
      // to contain all white pixels
      this.paint = function () {

        var context = htmlCanvas.getContext("2d");
        var sparams = this.screenParams(dim.width, dim.height);
        var x, y;

        // clear the canvas
        context.clearRect(0,0,htmlCanvas.width,htmlCanvas.height);

        // draw each pixel individually
        _.each(pixelBuffer, function(column, i){
          _.each(column, function(color, j){
            x = sparams.xoffset + i*sparams.pixelSize;
            y = sparams.yoffset + j*sparams.pixelSize;
            context.fillStyle = color;
            context.fillRect(x,y,sparams.pixelSize,sparams.pixelSize);
          });
        });

        // reset grid to all white 
        pixelBuffer = makePixelGrid(dim.width, dim.height);
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
      this.screenParams = function (pixelWidth, pixelHeight) {
        var retval = {};

        var height = htmlCanvas.height;
        var width = htmlCanvas.width;
        
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
      //   y: y position of the pixel in the grid from bottom most (0) to top
      //      most (+ height)
      //   color: tuple containing fields for red, green, and blue 8 bit integer
      //          values
      this.setPixel = function (x, y, color) {
        // dont write to buffer if location is outside canvas bounds
        if(x > dim.width || x < 0 || y > dim.height || y < 0) return;
        pixelBuffer[x][y] = hexColor(color);
      };
    };

    return PixelCanvas;
  }
);
