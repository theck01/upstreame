define([], function () {
  // Singleton containing all constants for the Blog application.
  var Constants = Object.create(null);

  Constants.LOGO_CANVAS_DIMENSIONS = { width: 80, height: 80 };
  Constants.LOGO_CANVAS_OFFSET = { x: 40, y: 40 };

  return Constants;
});
