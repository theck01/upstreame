define(["jquery", "underscore", "graphics/pixelcanvas", "graphics/color"],
  function($, _, PixelCanvas, Color){
    
    // PixelColorer provides methods for creating pixel art in the browser and
    // exporting that art in a JSON string, using a PixelCanvas instance to draw
    // pixels on an HTML canvas
    //
    // Constructor Arguments;
    //   width: width of the pixel canvas in meta-pixels
    //   height: height of the pixel canvas in meta-pixels
    //   canvasID: css selector style id of the canvas on the page
    var PixelColorer = function (width, height, canvasID) {

      var action = "set";
      var pixelWidth = width;
      var pixelHeight = height;
      var currentColor = { red: 0, green: 0, blue: 0 };
      var $htmlCanvas = $(canvasID);
      var pixels = [];
      var pCanvas = new PixelCanvas(pixelWidth, pixelHeight, canvasID);
      var that = this;


      // set up mouse listener for click events
      $htmlCanvas.click(function (e) {

        var canvasOffset = $htmlCanvas.offset();
        var relx = e.pageX - canvasOffset.left;
        var rely = e.pageY - canvasOffset.top;

        var sparams = pCanvas.screenParams(pixelWidth, pixelHeight);

        var x = Math.floor((relx - sparams.xoffset)/sparams.pixelSize);
        var y = Math.floor((rely - sparams.yoffset)/sparams.pixelSize);
        
        console.log(relx);
        console.log(rely);
        console.log(x);
        console.log(y);

        if(action === "set"){
          pixels.push({ x: x, y: y, color: currentColor });
          that.paint();
        }
        else if(action === "get"){
          currentColor = _.clone(pCanvas.getPixel(x, y));
        }
        else if(action === "clear"){
          pixels = _.reject(pixels, function (p) {
            return p.x === x && p.y === y;
          });
          that.paint();
        }
      });


      // clearCanvas reverts all pixels on the PixelCanvas to their default
      // color
      this.clearCanvas = function () {
        pixels = [];
      };


      // exportPixels generates a JSON string of all meta-pixels set on the
      // canvas, with additional meta-data about minimum canvas size required to
      // display the image
      //
      // Returns:
      //   A JSON string representing an object with the fields:
      //   pixels: An array of objects with x, y, and colorTuple fields
      //   imageWidth: The minimum width of a PixelCanvas required to show the
      //               complete image
      //   imageHeight: The minimum height of a PixelCanvas required to show the
      //                complete image
      //   center: An object with x and y fields for the center of the image
      this.exportImage = function () {
        var image = {};
        var xvalues = _.map(pixels, function (p) {
          return p.x;
        });
        var yvalues = _.map(pixels, function (p) {
          return p.y;
        });


        image.pixels = pixels;
        image.imageWidth = Math.max(xvalues) - Math.min(xvalues) + 1;
        image.imageHeight = Math.max(yvalues) - Math.min(yvalues) + 1;
        image.center = { x: Math.floor(image.Width/2),
                         y: Math.floor(image.Height/2) };

        return JSON.stringify(image);
      };


      // getColor returns the current color that will be set to pixels when
      // clicked on
      //
      // Returns:
      //   A tuple containing fields for red, green, and blue 8 bit integer
      //   values
      this.getColor = function () {
        return _.clone(currentColor);
      };


      // paint writes all stored pixels to the PixelCanvas and calls the
      // PixelCanvas' paint method
      this.paint = function () {
        var context = $htmlCanvas[0].getContext("2d");
        var i = 0;
        var sparams = pCanvas.screenParams(pixelWidth, pixelHeight);

        _.each(pixels, function(p) {
          pCanvas.setPixel(p.x, p.y, p.color);
        });

        pCanvas.paint();

        // draw grid system after pixels have been painted, for visibility
        for( ; i<=pixelWidth; i++){
          context.moveTo(sparams.xoffset + i*sparams.pixelSize,
                         sparams.yoffset);
          context.lineTo(sparams.xoffset + i*sparams.pixelSize,
                         sparams.yoffset + pixelHeight*sparams.pixelSize);
        }

        for(i=0 ; i<=pixelHeight; i++){
          context.moveTo(sparams.xoffset,
                         sparams.yoffset + i*sparams.pixelSize);
          context.lineTo(sparams.xoffset + pixelWidth*sparams.pixelSize,
                         sparams.yoffset + i*sparams.pixelSize);
        }

        context.strokeStyle = "#777777";
        context.stroke();
      };


      // resizeCanvas resizes the number of meta-pixels available for drawing
      // on the canvas element
      //
      // Arguments:
      //   width: width of the pixel canvas in meta-pixels
      //   height: height of the pixel canvas in meta-pixels
      this.resizeCanvas = function (width, height){
        pixelWidth = width;
        pixelHeight = height;
        pCanvas = PixelCanvas(pixelWidth, pixelHeight, canvasID);
        this.paint();
      };


      // setAction sets the action that will be performed when a pixel is
      // clicked on
      //
      // Arguments:
      //   actionString: One of the following strings -
      //                 "clear", returns the pixel to the default color of the 
      //                          canvas
      //                 "get", returns the color of the pixel clicked on
      //                 "set", sets the color of the pixel clicked on
      this.setAction = function (actionString) {
        action = actionString;
      };


      // setColor sets the current color that will be drawn on pixels that are
      // clicked on
      //
      // Arguments:
      //   colorTuple: A tuple containing fields for red, green, and blue with
      //               8 bit integer values
      this.setColor = function (colorTuple) {
        currentColor = Color.sanitize(colorTuple);
      };
    };

    return PixelColorer;
  }
);
