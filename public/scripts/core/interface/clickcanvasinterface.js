define(["jquery", "underscore", "core/util/eventhub"],
  function($, _, EventHub){
    
    // ClickCanvasInterface provides a mouse input interface to a PixelCanvas
    //
    // Constructor Arguments;
    //   pixelCanvas: instance of Pixel Canvas
    var ClickCanvasInterface = function (pixelCanvas) {
      this.$htmlCanvas = $(pixelCanvas.getCanvasID());
      this.mouseDown = false;
      this.mouseMoveAction = function () {};
      this.path = [];
      this.pCanvas = pixelCanvas;

      this.$htmlCanvas.on("mouseup mouseleave",
                          this._onMouseRelease.bind(this));
      this.$htmlCanvas.on("mousedown mousemove",
                          this._onMouseAction.bind(this));
    };

    
    // _getClickedPixel is a private method that returns the corresponding
    // pixel on the PixelCanvas that was clicked, or null if the click is
    // outside of pixel bounds
    //
    // Arguments:
    //   screenPos: object with 'x' and 'y' fields
    // Returns
    //   Object with 'x' and 'y' fields
    ClickCanvasInterface.prototype._getClickedPixel = function (screenPos) {
      var canvasOffset = this.$htmlCanvas.offset();
      var relx = screenPos.x - canvasOffset.left;
      var rely = screenPos.y - canvasOffset.top;

      var sparams = this.pCanvas.screenParams();

      var pixelPos = {
        x: Math.floor((relx - sparams.xoffset)/sparams.pixelSize),
        y: Math.floor((rely - sparams.yoffset)/sparams.pixelSize)
      };

      if(this.pCanvas.containsCoord(pixelPos)) return pixelPos;
      return null;
    };

    
    // _onMouseAction is a private function that handles mousedown and
    // mouse move events
    ClickCanvasInterface.prototype._onMouseAction = function (e) {
      if(e.type === "mousedown") this.mouseDown = true;
      if(!this.mouseDown) return;

      var pixelPos = this._getClickedPixel({ x: e.pageX, y: e.pageY });
      var exists = !!_.find(this.path, function (p) {
        return _.isEqual(p, pixelPos);
      });

      if (pixelPos && !exists) {
        this.path.push(pixelPos);
        EventHub.trigger("canvas.action", { positions: this.path });
      }
    };

    
    // _onMouseRelease is a private function that handles mouseup and
    // mouseleave events
    ClickCanvasInterface.prototype._onMouseRelease = function () {
      this.mouseDown = false;
      if (this.path.length > 0) {
        EventHub.trigger("canvas.release", { positions: this.path });
        this.path = [];
      }
    };


    // paint writes all stored pixels to the PixelCanvas and calls the
    // PixelCanvas" paint method
    ClickCanvasInterface.prototype.paintGrid = function () {
      var context = this.$htmlCanvas[0].getContext("2d");
      var i = 0;
      var sparams = this.pCanvas.screenParams();

      context.beginPath();

      for( ; i<=this.dim.width; i++){
        context.moveTo(sparams.xoffset + i*sparams.pixelSize,
                       sparams.yoffset);
        context.lineTo(sparams.xoffset + i*sparams.pixelSize,
                       sparams.yoffset + this.dim.height*sparams.pixelSize);
      }

      for(i=0 ; i<=this.dim.height; i++){
        context.moveTo(sparams.xoffset,
                       sparams.yoffset + i*sparams.pixelSize);
        context.lineTo(sparams.xoffset + this.dim.width*sparams.pixelSize,
                       sparams.yoffset + i*sparams.pixelSize);
      }

      context.closePath();
      context.strokeStyle = "#777777";
      context.stroke();
    };


    return ClickCanvasInterface;
  }
);
