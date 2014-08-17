define(["jquery"], function($){
  // MetaPixelClickInterface provides a mouse input interface to a PixelCanvas
  //
  // Constructor Arguments;
  //   pixelCanvas: instance of Pixel Canvas
  //   modelBuilder: instance of GridModelBuilder
  var MetaPixelClickInterface = function (pixelCanvas, modelBuilder) {
    this._$htmlCanvas = $(pixelCanvas.getCanvasID());
    this._mouseDown = false;
    this._modelBuilder = modelBuilder;
    this._pCanvas = pixelCanvas;

    this._$htmlCanvas.on("mouseup mouseleave",
                        this._onMouseRelease.bind(this));
    this._$htmlCanvas.on("mousedown mousemove",
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
  MetaPixelClickInterface.prototype._getClickedPixel = function (screenPos) {
    var canvasOffset = this._$htmlCanvas.offset();
    var relx = screenPos.x - canvasOffset.left;
    var rely = screenPos.y - canvasOffset.top;

    var sparams = this._pCanvas.screenParams();

    var pixelPos = {
      x: Math.floor((relx - sparams.xoffset)/sparams.pixelSize),
      y: Math.floor((rely - sparams.yoffset)/sparams.pixelSize)
    };

    if(this._pCanvas.containsCoord(pixelPos)) return pixelPos;
    return null;
  };

  
  // _onMouseAction is a private function that handles mousedown and
  // mouse move events
  MetaPixelClickInterface.prototype._onMouseAction = function (e) {
    if(e.type === "mousedown") this._mouseDown = true;
    if(!this._mouseDown) return;

    var pixelPos = this._getClickedPixel({ x: e.pageX, y: e.pageY });
    this._modelBuilder.addLocationToCurrentChange(pixelPos);
  };

  
  // _onMouseRelease is a private function that handles mouseup and
  // mouseleave events
  MetaPixelClickInterface.prototype._onMouseRelease = function () {
    this._mouseDown = false;
    this._modelBuilder.commitCurrentChange();
  };


  return MetaPixelClickInterface;
});
