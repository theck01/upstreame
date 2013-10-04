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

      var $htmlCanvas = $(canvasID);
      var action = "set";
      var backgroundColor = "#FFFFFF";
      var currentColor = "#000000";
      var mouseDown = false;
      var pCanvas = new PixelCanvas(width, height, backgroundColor, canvasID);
      var pixelWidth = width;
      var pixelHeight = height;
      var pixels = [];
      var mouseMoveAction = function () {};
      var that = this;


      // on mouseup or mouseleave set mouseDown to false
      $htmlCanvas.on("mouseup mouseleave", function () {
        mouseDown = false;
      });


      // set up mouse listener for down and movement events
      $htmlCanvas.on("mousedown mousemove", function (e) {

        if(e.type === "mousedown") mouseDown = true;

        // if user is not currently clicking, do nothing
        if(!mouseDown) return;

        var canvasOffset = $htmlCanvas.offset();
        var relx = e.pageX - canvasOffset.left;
        var rely = e.pageY - canvasOffset.top;

        var sparams = pCanvas.screenParams(pixelWidth, pixelHeight);

        var x = Math.floor((relx - sparams.xoffset)/sparams.pixelSize);
        var y = Math.floor((rely - sparams.yoffset)/sparams.pixelSize);

        var matchingPixel = _.find(pixels, function (p) {
          return p.x === x && p.y === y;
        });

        // if click was outside pixel region do nothing
        if(x > pixelWidth || x < 0 || y > pixelHeight || y < 0) return;

        if(action === "set"){
          if(matchingPixel){
            if(matchingPixel.color !== currentColor){
              matchingPixel.color = currentColor;
              that.paint();
            }
          }
          else{
            pixels.push({ x: x, y: y, color: currentColor });
            that.paint();
          }
        }
        else if(action === "get"){
          if(matchingPixel)
            currentColor = matchingPixel.color;
          else
            currentColor = _.clone(pCanvas.getPixel(x, y));
        }
        else if(action === "clear"){
          pixels = _.reject(pixels, function (p) {
            return p.x === x && p.y === y;
          });
          that.paint();
        }

        mouseMoveAction(e);
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
      //   pixels: An array of objects with x, y, and color fields
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
        var imageWidth = Math.max(xvalues) - Math.min(xvalues) + 1;
        var imageHeight = Math.max(yvalues) - Math.min(yvalues) + 1;


        image.pixels = pixels;
        image.center = { x: Math.floor(imageWidth/2),
                         y: Math.floor(imageHeight/2) };

        return JSON.stringify(image);
      };


      // getBackgroundColor returns the current color that will be set to pixels
      // that have not been clicked on
      //
      // Returns:
      //   A color hexadecimal string in the form "#RRGGBB"
      this.getBackgroundColor = function () {
        return backgroundColor;
      };


      // getColor returns the current color that will be set to pixels when
      // clicked on
      //
      // Returns:
      //   A color hexadecimal string in the form "#RRGGBB"
      this.getColor = function () {
        return currentColor;
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
        context.beginPath();

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

        context.closePath();
        context.strokeStyle = "#777777";
        context.stroke();
      };


      // click registers onclick callback for canvas to run after the body
      // PixelCanvas onclick event has run
      //
      // Arguments:
      //   callbackFunction: A function that may optionally take a jQuery click
      //                     event to do further processing with the click
      this.mousemove = function (callbackFunction) {
        mouseMoveAction = callbackFunction;
      };


      // resize resizes the number of meta-pixels available for drawing
      // on the canvas element
      //
      // Arguments:
      //   width: width of the pixel canvas in meta-pixels
      //   height: height of the pixel canvas in meta-pixels
      this.resize = function (width, height){
        pixelWidth = width;
        pixelHeight = height;
        pCanvas = new PixelCanvas(pixelWidth, pixelHeight, backgroundColor,
                                  canvasID);
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


      // setBackgroundColor sets the background color of the pixel canvas,
      // where the default is #FFFFFF
      //
      // Arguments:
      //   color: a hexadecimal string "#RRGGBB"
      this.setBackgroundColor = function (color) {
        backgroundColor = Color.sanitize(color);
        pCanvas = new PixelCanvas(pixelWidth, pixelHeight, backgroundColor,
                                  canvasID);
        this.paint();
      };


      // setColor sets the current color that will be drawn on pixels that are
      // clicked on
      //
      // Arguments:
      //   color: a hexadecimal string in the format "#RRGGBB"
      this.setColor = function (color) {
        currentColor = Color.sanitize(color);
      };
    };

    return PixelColorer;
  }
);
