define([], function () {
  // Singleton containing all constants for the Blog application.
  var Constants = Object.create(null);

  Constants.LOGO_CANVAS_DIMENSIONS = { width: 64, height: 64 };
  Constants.LOGO_CANVAS_OFFSET = { x: 32, y: 32 };

  return Constants;
});
