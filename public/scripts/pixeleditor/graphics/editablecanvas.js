define(
    ['core/graphics/color', 'core/graphics/pixelcanvas'],
    function (Color, PixelCanvas) {
  // EditableCanvas object adds grid and selection box visualization
  // capabilities to a normal PixelCanvas.
  //
  // Constructor Arguments:
  //   dimensions: object with 'width' and 'height' fields
  //   canvasID: css selector style id of the canvas on the page
  //   backgroundColor: default color of pixels not drawn to, "#RRGGBB" string
  //       Optional, default is undefined (transparent).
  //   availableSpace: object with 'width' and 'height' fields available
  //                   on the vanbas element for the pixel canvas.
  var EditableCanvas = function (
      dimensions, canvasID, backgroundColor, availableSpace) {
    PixelCanvas.call(
        this, dimensions, canvasID, backgroundColor, availableSpace);

    this._gridColor = Color.toObject(EditableCanvas.DEFAULT_GRID_COLOR);
    this._requiresRedraw = false;
    this._shouldDrawGrid = true;
    this._selectionBox = { origin: null, terminator: null };
    this._selectionColor = Color.toObject(
        EditableCanvas.DEFAULT_SELECTION_COLOR);
  };
  EditableCanvas.prototype = Object.create(PixelCanvas.prototype);
  EditableCanvas.prototype.constructor = EditableCanvas;


  EditableCanvas.DEFAULT_GRID_COLOR = '#BBBBBB';
  EditableCanvas.GRID_LINE_WIDTH = 1;

  EditableCanvas.DEFAULT_SELECTION_COLOR = '#FF00FF';
  EditableCanvas.SELECTION_LINE_WIDTH = 3;

  // clearSelection clears the selection on the canvas and forces the canvas to
  // be redrawn.
  EditableCanvas.prototype.clearSelection = function () {
    if (this._selectionBox.origin || this._selectionBox.terminator) {
      this._selectionBox = { origin: null, terminator: null };
      this.clear();
      this.markForRedraw();
    }
  };


  // doesRequireRedraw returns whether the canvas has been marked as updated
  // since last being painted.
  EditableCanvas.prototype.doesRequireRedraw = function () {
    return this._requiresRedraw;
  };


  // getSelection returns the current selection object.
  EditableCanvas.prototype.getSelection = function () {
    return this._selectionBox;
  };


  // markForRedraw marks the canvas has having changed since the last time that
  // it was painted to the screen.
  EditableCanvas.prototype.markForRedraw = function () {
    this._requiresRedraw = true;
  };


  // paint draws the canvas to the screen, along with grid and/or selection.
  // Method sets the canvas require redraw to false.
  EditableCanvas.prototype.paint = function () {
    this._paintToImageData();

    if (this._shouldDrawGrid) this._paintGridToImageData();
    if (this._selectionBox.origin && this._selectionBox.terminator) {
      this._paintSelectionToImageData();
    }

    this._paintImageDataToScreen();
    this._requiresRedraw = false;
  };


  // _paintLineToImageData paints a horizontal or vertical line to the
  // pixel canvas image data, with given with and color.
  //
  // Arguments:
  //     origin: An object with 'x' and 'y' fields
  //     terminator: An object with 'x' and 'y' fields
  //     width: The width of the line to draw, in pixels.
  //     colorObj: An object with 'red', 'green', and 'blue' fields.
  EditableCanvas.prototype._paintLineToImageData = function (
      origin, terminator, width, colorObj) {
    // Assert that the line being drawn is either horizontal or vertical.
    if (origin.x !== terminator.x && origin.y !== terminator.y) {
      throw Error(
          'Can only draw a horizontal or vertical lines to the canvas.');
    }

    var lengthAxis;
    var widthAxis;
    if (origin.x === terminator.x) {
      lengthAxis = 'y';
      widthAxis = 'x';
    }
    else {
      lengthAxis = 'x';
      widthAxis = 'y';
    }
    
    // Ensure that the point marked as origin occurs before the terminator.
    if (origin[lengthAxis] > terminator[lengthAxis]) {
      var tmp = origin;
      origin = terminator;
      terminator = tmp;
    }

    var lowerWidthRange = origin[widthAxis] - Math.floor(width / 2);
    var upperWidthRange = origin[widthAxis] + Math.ceil(width / 2);
    var imageData = this._getImageData();
    for (var i = origin[lengthAxis]; i <= terminator[lengthAxis]; i++) {
      for (var j = lowerWidthRange; j < upperWidthRange; j++) {
        var imageIndex = lengthAxis === 'y' ?
            (i * imageData.width + j) * 4 :
            (j * imageData.width + i) * 4;
        imageData.data[imageIndex] = colorObj.red;
        imageData.data[imageIndex + 1] = colorObj.green;
        imageData.data[imageIndex + 2] = colorObj.blue;
        imageData.data[imageIndex + 3] = 255;
      }
    }
  };


  // _paintGridToImageData draws all grid lines to the image data for the
  // canvas.
  EditableCanvas.prototype._paintGridToImageData = function () {
    var dimensions = this.getDimensions();
    var sparams = this.getScreenParams();

    for (var i = 1; i < dimensions.width; i++) {
      this._paintLineToImageData(
          { x: i * sparams.pixelSize + sparams.xoffset, y: sparams.yoffset },
          {
            x: i * sparams.pixelSize + sparams.xoffset,
            y: sparams.yoffset + dimensions.height * sparams.pixelSize
          }, EditableCanvas.GRID_LINE_WIDTH, this._gridColor);
    }

    for (var i = 1; i < dimensions.height; i++) {
      this._paintLineToImageData(
          { x: sparams.xoffset, y: i * sparams.pixelSize + sparams.yoffset },
          {
            x: sparams.xoffset + dimensions.width * sparams.pixelSize,
            y: i * sparams.pixelSize + sparams.yoffset
          }, EditableCanvas.GRID_LINE_WIDTH, this._gridColor);
    }
  };


  // _paintGridToImageData draws all selection box lines to the image data for
  // the canvas.
  EditableCanvas.prototype._paintSelectionToImageData = function () {
    if (!this._selectionBox.origin || !this._selectionBox.terminator) return;

    this._paintLineToImageData(
        { x: this._selectionBox.origin.x, y: this._selectionBox.origin.y },
        { x: this._selectionBox.terminator.x, y: this._selectionBox.origin.y },
        EditableCanvas.SELECTION_LINE_WIDTH, this._selectionColor);
    this._paintLineToImageData(
        { x: this._selectionBox.origin.x, y: this._selectionBox.origin.y },
        { x: this._selectionBox.origin.x, y: this._selectionBox.terminator.y },
        EditableCanvas.SELECTION_LINE_WIDTH, this._selectionColor);
    this._paintLineToImageData(
        { x: this._selectionBox.terminator.x, y: this._selectionBox.origin.y },
        {
          x: this._selectionBox.terminator.x,
          y: this._selectionBox.terminator.y
        }, EditableCanvas.SELECTION_LINE_WIDTH, this._selectionColor);
    this._paintLineToImageData(
        { x: this._selectionBox.origin.x, y: this._selectionBox.terminator.y },
        {
          x: this._selectionBox.terminator.x,
          y: this._selectionBox.terminator.y
        }, EditableCanvas.SELECTION_LINE_WIDTH, this._selectionColor);
  };


  // setSelectionOrigin sets the origin point of the screen selection box.
  //
  // Arguments:
  //     coord: object with 'x' and 'y' fields.
  EditableCanvas.prototype.setSelectionOrigin = function (coord) {
    if (!this._selectionBox.origin ||
        this._selectionBox.origin.x !== coord.x ||
        this._selectionBox.origin.y !== coord.y) {
      this._selectionBox.origin = coord;
      this.clear();
      this.markForRedraw();
    }
  };


  // setSelectionTerminator sets the termination point of the screen selection
  // box.
  //
  // Arguments:
  //     coord: object with 'x' and 'y' fields.
  EditableCanvas.prototype.setSelectionTerminator = function (coord) {
    if (!this._selectionBox.terminator ||
        this._selectionBox.terminator.x !== coord.x ||
        this._selectionBox.terminator.y !== coord.y) {
      this._selectionBox.terminator = coord;
      this.clear();
      this.markForRedraw();
    }
  };


  // setShouldDrawGrid sets whether a grid should be drawn on the canvas, and
  // forces a full canvas redraw if the value changes.
  //
  // Arguments:
  //     shouldDrawGrid: Whether the grid should be drawn on the canvas or not.
  EditableCanvas.prototype.setShouldDrawGrid = function (shouldDrawGrid) {
    if (shouldDrawGrid !== this._shouldDrawGrid) {
      this._shouldDrawGrid = !!shouldDrawGrid;
      this.clear();
      this.markForRedraw();
    }
  };


  return EditableCanvas;
});
