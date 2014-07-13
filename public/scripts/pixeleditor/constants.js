define([], function () {
  // Centralized access points to constants in the pixel editor applications.
  var Constants = Object.create(null);

  Constants.AVAILABLE_TOOLS = {
    PAINTBRUSH: 'paintbrush-tool',
    DROPPER: 'dropper-tool',
    PAINTBUCKET: 'paintbucket-tool',
    ERASER: 'eraser-tool'
  };

  Constants.COLOR_PALETTE_SIZE = 12;

  Constants.STARTING_VALUES = {
    ACTIVE_COLOR: '#000000',
    DEFAULT_COLOR: '#FFFFFF',
    DEFAULT_TOOL: Constants.AVAILABLE_TOOLS.PAINTBRUSH
  };

  Constants.TOOL_ICON_CLASSES = Object.create(null);
  Constants.TOOL_ICON_CLASSES[Constants.AVAILABLE_TOOLS.PAINTBRUSH] =
      'icon-paint-brush';
  Constants.TOOL_ICON_CLASSES[Constants.AVAILABLE_TOOLS.DROPPER] =
      'icon-dropper';
  Constants.TOOL_ICON_CLASSES[Constants.AVAILABLE_TOOLS.PAINTBUCKET] =
      'icon-paint-bucket';
  Constants.TOOL_ICON_CLASSES[Constants.AVAILABLE_TOOLS.ERASER] =
      'icon-eraser';

  return Constants;
});
