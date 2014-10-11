define(["jquery", "pixeleditor/constants"], function($, Constants){
  // MetaPixelClickInterface provides a mouse input interface to a PixelCanvas
  //
  // Constructor Arguments;
  //   pixelCanvas: instance of Pixel Canvas
  //   modelBuilder: instance of GridModelBuilder
  //   dimensionsValue: instance of a Value containing the current canvas
  //       dimensions.
  //   toolValue: instance of a Value containing the current tool selection.
  //   canvasClickedValue: instance of a Value containing a boolean of
  //       whether the canvas is currently being interacted with.
  var MetaPixelClickInterface = function (
      pixelCanvas, modelBuilder, dimensionsValue, toolValue,
      canvasClickedValue, undosAvailableValue, redosAvailableValue) {
    this._$htmlCanvas = $(pixelCanvas.getCanvasID());
    this._modelBuilder = modelBuilder;
    this._pCanvas = pixelCanvas;
    this._dimensionsValue = dimensionsValue;
    this._toolValue = toolValue;
    this._canvasClickedValue = canvasClickedValue;
    this._undosAvailableValue = undosAvailableValue;
    this._redosAvailableValue = redosAvailableValue;
    
    this._canvasClickedValue.setValue(false);

    this._$htmlCanvas.on("mouseup mouseleave touchend touchleave",
                        this._onMouseRelease.bind(this));
    this._$htmlCanvas.on("mousedown mousemove touchstart touchmove",
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
    var x = 0;
    var y = 0;

    if (e.originalEvent instanceof MouseEvent) {
      x = e.pageX;
      y = e.pageY;
    }
    else if (e.originalEvent instanceof TouchEvent) {
      x = e.originalEvent.touches[0].pageX;
      y = e.originalEvent.touches[0].pageY;
    }

    return {
      x: Math.floor(x - canvasOffset.left),
      y: Math.floor(y - canvasOffset.top),
    };
  };
  
  
  // _getMetaPixelCoord returns the corresponding pixel on the EditableCanvas
  // that was clicked, or null if the click is outside of pixel bounds and the
  // method is searching for exact matches.
  //
  // Arguments:
  //   coord: object with 'x' and 'y' fields, canvas relative pixel coordinate.
  //   opt_getNearest: Whether to retrieve the nearest pixel if the coord does
  //     not exactly match a pixel. Defaults to false.
  // Returns:
  //   Object with 'x' and 'y' fields, or null if a meta pixel at the location
  //   does not exist and the method is searching for exact matches.
  MetaPixelClickInterface.prototype._getMetaPixelCoord = function (
      coord, opt_getNearest) {
    var pixelPos = {
      x: this._getMetaPixelComponent(coord, "x", opt_getNearest),
      y: this._getMetaPixelComponent(coord, "y", opt_getNearest)
    };

    if(this._pCanvas.containsCoord(pixelPos)) return pixelPos;
    return null;
  };


  // _getMetaPixelComponent returns the location of the pixel on the given axis
  // of the EditableCanvas that was clicked, which may be outsize of the 
  // EditableCanvas bounds if opt_getNearest is not specified as true.
  //
  // Arguments:
  //   coord: object with 'x' and 'y' fields, canvas relative pixel coordinate.
  //   axis: Either 'x' or 'y'.
  //   opt_getNearest: Whether to retrieve the nearest location on the axis if
  //     the coord appears beyond the canvas bounds. Defaults to false.
  // Returns:
  //   Number, location on the given axis where the pixel appears.
  MetaPixelClickInterface.prototype._getMetaPixelComponent = function (
      coord, axis, opt_getNearest) {
    var sparams = this._pCanvas.screenParams();
    var offset = axis === "x" ? "xoffset" : "yoffset";
    var loc = Math.floor((coord[axis] - sparams[offset])/sparams.pixelSize);

    if (opt_getNearest) {
      var canvasDimensions = this._pCanvas.getDimensions();
      var dimension = axis === "x" ? "width" : "height";
      loc = Math.max(Math.min(loc, canvasDimensions[dimension] - 1), 0);
    }

    return loc;
  };

  
  // _onMouseAction is a private function that handles mousedown and
  // mouse move events
  MetaPixelClickInterface.prototype._onMouseAction = function (e) {
    if(e.type === "mousedown" || e.type === "touchstart") {
      this._canvasClickedValue.setValue(true);
    }
    if(!this._canvasClickedValue.getValue()) return;
    var coord = this._getCanvasRelativeCoordinate(e);

    switch (Constants.TOOL_TO_TYPE_MAP[this._toolValue.getValue()]) {
      case Constants.TOOL_TYPES.SINGLE_PIXEL:
      case Constants.TOOL_TYPES.DRAG:
        var pixelPos = this._getMetaPixelCoord(coord);
        if (pixelPos) {
          this._modelBuilder.addLocationToCurrentChange(pixelPos);
        }
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
    if (!this._canvasClickedValue.getValue()) return;
    this._canvasClickedValue.setValue(false);

    switch (Constants.TOOL_TO_TYPE_MAP[this._toolValue.getValue()]) {
      case Constants.TOOL_TYPES.SINGLE_PIXEL:
        this._modelBuilder.commitCurrentChange();
        break;

      case Constants.TOOL_TYPES.DRAG:
        this._modelBuilder.commitCurrentChange();

        // Clear the canvas as well as the current painted buffer, to ensure
        // that no artifacts remain after drag.
        this._pCanvas.clear(true /* opt_clearBuffer */);
        this._modelBuilder.paint();
        break;

      case Constants.TOOL_TYPES.SELECTION:
        var selection = this._pCanvas.getSelection();
        if (!selection.origin || !selection.terminator) break;

        var originMetaPixel = this._getMetaPixelCoord(selection.origin, true);
        var terminatorMetaPixel = this._getMetaPixelCoord(
            selection.terminator, true);
        var dimensions = {
          width: Math.abs(originMetaPixel.x - terminatorMetaPixel.x) + 1,
          height: Math.abs(originMetaPixel.y - terminatorMetaPixel.y) + 1
        };
        var origin = {
          x: Math.min(originMetaPixel.x, terminatorMetaPixel.x),
          y: Math.min(originMetaPixel.y, terminatorMetaPixel.y)
        };

        this._modelBuilder.zoomIn(origin, dimensions);

        // Clear the canvas as well as the current painted buffer, to ensure
        // that no artifacts remain after zoom.
        this._pCanvas.clear(true /* opt_clearBuffer */);
        this._pCanvas.clearSelection();
        this._modelBuilder.paint();
        break;

      case Constants.TOOL_TYPES.CANVAS_CLICK:
        if (this._toolValue.getValue() === Constants.AVAILABLE_TOOLS.ZOOM_OUT) {
          this._modelBuilder.zoomOut();

          // Clear the canvas as well as the current painted buffer, to ensure
          // that no artifacts remain after zoom.
          this._pCanvas.clear(true /* opt_clearBuffer */);
          this._modelBuilder.paint();
        }
        break;
    }

    this._redosAvailableValue.setValue(this._modelBuilder.hasRedos());
    this._undosAvailableValue.setValue(this._modelBuilder.hasUndos());
  };


  return MetaPixelClickInterface;
});
