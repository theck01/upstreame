define(['core/controller/gridmodelbuilder'], function (GridModelBuilder) {
  // Centralized access points to constants in the pixel editor applications.
  var Constants = Object.create(null);

  Constants.AVAILABLE_TOOLS = {
    PAINTBRUSH: 'paintbrush-tool',
    DROPPER: 'dropper-tool',
    PAINTBUCKET: 'paintbucket-tool',
    ERASER: 'eraser-tool',
    ZOOM: 'zoom-tool',
    CROP: 'crop-tool'
  };

  Constants.COLOR_PALETTE_SIZE = 12;

  Constants.STARTING_VALUES = {
    ACTIVE_COLOR: '#000000',
    DEFAULT_COLOR: '#FFFFFF',
    DEFAULT_TOOL: Constants.AVAILABLE_TOOLS.PAINTBRUSH,
    CANVAS_DIMENSIONS: { width: 16, height: 16 }
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
  Constants.TOOL_ICON_CLASSES[Constants.AVAILABLE_TOOLS.ZOOM] =
      'icon-zoom-in';
  Constants.TOOL_ICON_CLASSES[Constants.AVAILABLE_TOOLS.CROP] = '';

  Constants.TOOL_TO_ACTION_MAP = Object.create(null);
  Constants.TOOL_TO_ACTION_MAP[Constants.AVAILABLE_TOOLS.PAINTBRUSH] =
      GridModelBuilder.CONTROLLER_ACTIONS.SET;
  Constants.TOOL_TO_ACTION_MAP[Constants.AVAILABLE_TOOLS.DROPPER] =
      GridModelBuilder.CONTROLLER_ACTIONS.GET;
  Constants.TOOL_TO_ACTION_MAP[Constants.AVAILABLE_TOOLS.PAINTBUCKET] =
      GridModelBuilder.CONTROLLER_ACTIONS.FILL;
  Constants.TOOL_TO_ACTION_MAP[Constants.AVAILABLE_TOOLS.ERASER] =
      GridModelBuilder.CONTROLLER_ACTIONS.CLEAR;
  Constants.TOOL_TO_ACTION_MAP[Constants.AVAILABLE_TOOLS.ZOOM] =
      GridModelBuilder.CONTROLLER_ACTIONS.NONE;
  Constants.TOOL_TO_ACTION_MAP[Constants.AVAILABLE_TOOLS.CROP] =
      GridModelBuilder.CONTROLLER_ACTIONS.NONE;

  Constants.KEYS = {
    ENTER: 13,
    ESCAPE: 27
  };

  return Constants;
});
