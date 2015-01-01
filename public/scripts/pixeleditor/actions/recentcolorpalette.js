define(
    ['domkit/util/handlercollection', 'core/graphics/color'],
    function (HandlerCollection, Color) {
  // RecentColorPalette tracks a palette of recently used colors and notifies
  // registered handlers when the palette changes.
  //
  // Arguments:
  //     paletteSize: The maximum number of colors to track.
  var RecentColorPalette = function (paletteSize) {
    this._handlerCollection = new HandlerCollection();
    this._paletteSize = paletteSize;
    this._colors = [];
  };


  // addPaletteChangeHandler registers a callback for when the recent color
  // palette changes
  //
  // Arguments:
  //     handler:
  //         A function that takes an array of hexadecimal color strings as an
  //         argument.
  RecentColorPalette.prototype.addPaletteChangeHandler = function (handler) {
    this._handlerCollection.addHandler(handler);
  };


  // colorUsed tracks a color as used, potentially updating the palette.
  //
  // Arguments:
  //     color: A hexadecimal color string in the form "#RRGGBB"
  RecentColorPalette.prototype.colorUsed = function (color) {
    if (!Color.isValid(color)) return;

    var sanitizedColor = Color.sanitize(color);
    if (this._colors[0] === sanitizedColor) return;

    var colorIndex = this._colors.indexOf(sanitizedColor);
    if (colorIndex >= 0) this._colors.splice(colorIndex, 1);

    this._colors.unshift(sanitizedColor);

    if (this._colors.length > this._paletteSize) {
      this._colors.length = this._paletteSize;
    }

    this._handlerCollection.callHandlers(this._colors);
  };


  // getPalette returns the array of colors in the palette in order of most
  // recently used to least recently used.
  RecentColorPalette.prototype.getPalette = function () {
    return this._colors;
  };


  // addPaletteChangeHandler removes a callback for when the recent color
  // palette changes
  //
  // Arguments:
  //     handler:
  //         A function that takes an array of hexadecimal color strings as an
  //         argument.
  RecentColorPalette.prototype.removePaletteChangeHandler = function (handler) {
    this._handlerCollection.removeHandler(handler);
  };


  return RecentColorPalette;
});
