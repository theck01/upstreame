define(["jquery", "pixeleditor/constants"], function($, Constants){
  // MetaPixelClickInterface provides a mouse input interface to a PixelCanvas
  //
  // Constructor Arguments;
  //   pixelCanvas: instance of Pixel Canvas
  //   modelBuilder: instance of GridModelBuilder
  //   value: instance of a Value containing the current tool selection.
  var MetaPixelClickInterface = function (
      pixelCanvas, modelBuilder, toolValue) {
    this._$htmlCanvas = $(pixelCanvas.getCanvasID());
    this._mouseDown = false;
    this._modelBuilder = modelBuilder;
    this._pCanvas = pixelCanvas;
    this._toolValue = toolValue;

    this._$htmlCanvas.on("mouseup mouseleave",
                        this._onMouseRelease.bind(this));
    this._$htmlCanvas.on("mousedown mousemove",
                        this._onMouseAction.bind(this));
  };


  // _getCanvasRelativeCoordinate returns the mouse coordinate of an event
  // relative to the canvas object, rather than to the window.
  //
  // Arguments:
  //     e: A jQuery mouse event.
  // Returns
  //     Object with 'x' and 'y' fields,
  MetaPixelClickInterface.prototype._getCanvasRelativeCoordinate =
      function (e) {
    var canvasOffset = this._$htmlCanvas.offset();
    return { x: e.pageX - canvasOffset.left, y: e.pageY - canvasOffset.top };
  };
  

  
  // _getClickedPixel returns the corresponding pixel on the EditableCanvas that
  // was clicked, or null if the click is outside of pixel bounds
  //
  // Arguments:
  //   coord: object with 'x' and 'y' fields
  // Returns
  //   Object with 'x' and 'y' fields
  MetaPixelClickInterface.prototype._getClickedPixel = function (coord) {
    var sparams = this._pCanvas.screenParams();
    var pixelPos = {
      x: Math.floor((coord.x - sparams.xoffset)/sparams.pixelSize),
      y: Math.floor((coord.y - sparams.yoffset)/sparams.pixelSize)
    };

    if(this._pCanvas.containsCoord(pixelPos)) return pixelPos;
    return null;
  };

  
  // _onMouseAction is a private function that handles mousedown and
  // mouse move events
  MetaPixelClickInterface.prototype._onMouseAction = function (e) {
    if(e.type === "mousedown") this._mouseDown = true;
    if(!this._mouseDown) return;
    var coord = this._getCanvasRelativeCoordinate(e);

    switch (Constants.TOOL_TO_TYPE_MAP[this._toolValue.getValue()]) {
      case Constants.TOOL_TYPES.SINGLE_PIXEL:
        var pixelPos = this._getClickedPixel(coord);
        this._modelBuilder.addLocationToCurrentChange(pixelPos);
        break;

      case Constants.TOOL_TYPES.SELECTION:
        var selection = this._pCanvas.getSelection();
        if (!selection.origin) {
          this._pCanvas.setSelectionOrigin(coord);
        }
        else {
          this._pCanvas.setSelectionTerminator(coord);
        }
        this._modelBuilder.paint();
        break;
    }
  };

  
  // _onMouseRelease is a private function that handles mouseup and
  // mouseleave events
  MetaPixelClickInterface.prototype._onMouseRelease = function () {
    this._mouseDown = false;

    switch (Constants.TOOL_TO_TYPE_MAP[this._toolValue.getValue()]) {
      case Constants.TOOL_TYPES.SINGLE_PIXEL:
        this._modelBuilder.commitCurrentChange();
        break;

      case Constants.TOOL_TYPES.SELECTION:
        this._pCanvas.clearSelection();
        this._modelBuilder.paint();
        break;
    }
  };


  return MetaPixelClickInterface;
});
