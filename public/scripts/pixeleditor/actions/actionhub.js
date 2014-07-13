define(
    ['underscore', 'core/graphics/color', 'pixeleditor/constants',
     'pixeleditor/actions/value', 'pixeleditor/actions/recentcolorpalette'],
    function (_, Color, Constants, Value, RecentColorPalette) {
  // A central access locations to the values in the pixel editor application.
  var ActionHub = Object.create(null);

  var colorValidator = function (newColor) {
    if (Color.isValid(newColor)) return Color.sanitize(newColor);
    return null;
  };

  var toolValidator = function (newTool) {
    var isToolAvailable =
        _.find(_.values(Constants.AVAILABLE_TOOLS), function (availableTool) {
      return newTool === availableTool;
    });
    if (isToolAvailable) return newTool;
    return null;
  };

  // Initialize values.
  ActionHub.activeColor = new Value(null, colorValidator);
  ActionHub.defaultColor = new Value(null, colorValidator);

  ActionHub.recentColors =
      new RecentColorPalette(Constants.COLOR_PALETTE_SIZE);

  ActionHub.currentTool =
      new Value(Constants.AVAILABLE_TOOLS, toolValidator);

  return ActionHub;
});
