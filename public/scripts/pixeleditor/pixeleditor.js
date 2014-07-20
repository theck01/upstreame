define(
    ['jquery', 'underscore', 'domkit/controllers/radiogroup',
     'domkit/ui/button', 'domkit/ui/palette',
     'core/controller/eventhub', 'core/controller/gridmodelbuilder',
     'core/graphics/color', 'core/graphics/pixelcanvas',
     'core/interface/clickcanvasinterface',
     'core/model/converters/spriteconverter', 'core/model/gridmodel',
     'pixeleditor/constants', 'pixeleditor/actions/recentcolorpalette',
     'pixeleditor/actions/value'],
    function (
        $, _, RadioGroup, Button, Palette, EventHub, GridModelBuilder, Color,
        PixelCanvas, ClickCanvasInterface, SpriteConverter, GridModel,
        Constants, RecentColorPalette, Value) {
  // Base application initializer.
  var PixelEditor = function () {
    this._$canvas = $('#pixel-editor-canvas');

    this._actions = this._initializeActions();
    this._buttons = this._initializeButtons();
    this._canvasTools = this._initializeCanvas();
    this._radioGroups = this._initializeRadioGroups();
    this._palettes = this._initializePalettes();
    this._initializeActiveColorSelectRouting();
    this._initializeDefaultColorSelectRouting();
    this._initializeToolSelectRouting();

    this._initializePlaceholder();
  };


  // _initializeActions initializes all of the actions in the application.
  // Returns an object mapping action names to actions.
  PixelEditor.prototype._initializeActions = function () {
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

    var actions = Object.create(null);
    actions.activeColor = new Value(null, colorValidator);
    actions.defaultColor = new Value(null, colorValidator);

    actions.recentColors =
        new RecentColorPalette(Constants.COLOR_PALETTE_SIZE);

    actions.currentTool =
        new Value(Constants.AVAILABLE_TOOLS, toolValidator);

    return actions;
  };

  // _initalizeActiveColorSelectRouting connects all of the components of the 
  // active color collect menu.
  PixelEditor.prototype._initializeActiveColorSelectRouting  = function () {
    var $colorSelectPreview =
        $('#active-color-select-menu').find('.color-select-preview');
    var $colorSelectInput =
        $('#active-color-select-menu').find('.color-select-text-input');
    var $activeColorIcon = $('#active-color-button').find('.icon-active-color');
    var $colorPaletteColors =
        $('#active-color-select-menu').find('.color-palette-color');
    var app = this;

    $colorSelectInput.on('keyup', function (e) {
      app._actions.activeColor.setValue($colorSelectInput.val());
      if (e.which === Constants.KEYS.ENTER) {
        app._palettes.activeColorSelect.visible(false);
      }
    });

    this._actions.activeColor.addValueChangeHandler(function (newColor) {
      $activeColorIcon.css('color', newColor);
      $colorSelectPreview.css('background-color', newColor);

      var inputVal = $colorSelectInput.val();
      if (!Color.isValid(inputVal) || (Color.sanitize(inputVal) !== newColor)) {
        $colorSelectInput.val(newColor);
      }
    });

    this._buttons.toolbar.activeColor.addStateHandler(function (state) {
      app._palettes.activeColorSelect.visible(state);
    });

    _.each(this._buttons.activeColorSelect.colorPalette, function (button, i) {
      button.addClickHandler(function () {
        var colors = app._actions.recentColors.getPalette();
        app._actions.activeColor.setValue(colors[i]);
      });
    });

    this._palettes.activeColorSelect.addVisibleStateHandler(
        function (isVisible) {
      if (!isVisible) {
        app._actions.recentColors.colorUsed(
            app._actions.activeColor.getValue());
      }
      else {
        var colors = app._actions.recentColors.getPalette();
        $colorPaletteColors.each(function (index) {
          if (colors[index]) {
            $(this).css({
              'background-color': colors[index],
              'display': ''
            });
          }
          else $(this).css('display', 'none');
        });
      }
    });

    // Set initial values
    this._actions.activeColor.setValue(Constants.STARTING_VALUES.ACTIVE_COLOR);
    this._actions.recentColors.colorUsed(
        Constants.STARTING_VALUES.ACTIVE_COLOR);
  };


  // initializeButtons initializes all domkit buttons and returns button
  // instances in an object with buttons namespaced to location in the view.
  //
  // Return: An array of domkit/Buttons
  PixelEditor.prototype._initializeButtons = function () {
    var buttons = Object.create(null);

    buttons.toolbar = Object.create(null);
    buttons.toolbar.activeColor = Button.create('#active-color-button');
    buttons.toolbar.defaultColor = Button.create('#default-color-button');
    buttons.toolbar.toolSelect = Button.create('#tool-select-button');
    buttons.toolbar.undo = Button.create('#undo-button');
    buttons.toolbar.redo = Button.create('#redo-button');
    buttons.toolbar.zoom = Button.create('#zoom-button');
    buttons.toolbar.trash = Button.create('#trash-button');
    buttons.toolbar.load = Button.create('#load-button');
    buttons.toolbar.save = Button.create('#save-button');
    buttons.toolbar.settings = Button.create('#settings-button');
    buttons.toolbar.session = Button.create('#session-button');

    buttons.toolSelectMenu = Object.create(null);
    buttons.toolSelectMenu.paintBrush =
        Button.create('#select-paint-brush-button');
    buttons.toolSelectMenu.dropper = Button.create('#select-dropper-button');
    buttons.toolSelectMenu.paintBucket =
        Button.create('#select-paint-bucket-button');
    buttons.toolSelectMenu.eraser = Button.create('#select-eraser-button');

    buttons.trashMenu = Object.create(null);
    buttons.trashMenu.yes = Button.create('#trash-confirm-yes');
    buttons.trashMenu.no = Button.create('#trash-confirm-no');

    buttons.activeColorSelect = Object.create(null);
    buttons.activeColorSelect.colorPalette = _.map(
        $('#active-color-select-menu').find('.color-palette-color'),
        function (paletteColor) {
      return Button.create($(paletteColor));
    });

    buttons.defaultColorSelect = Object.create(null);
    buttons.defaultColorSelect.colorPalette = _.map(
        $('#default-color-select-menu').find('.color-palette-color'),
        function (paletteColor) {
      return Button.create($(paletteColor));
    });

    return buttons;
  };


  // _initializeCanvas sets up the pixel canvas
  // Returns an instance of a PixelCanvas.
  PixelEditor.prototype._initializeCanvas  = function () {
    var app = this;
    var canvasTools = Object.create(null);

    canvasTools.pixelCanvas = new PixelCanvas(
        Constants.STARTING_VALUES.CANVAS_DIMENSIONS, '#pixel-editor-canvas',
        Constants.STARTING_VALUES.DEFAULT_COLOR);

    canvasTools.clickInterface = new ClickCanvasInterface(
        canvasTools.pixelCanvas);

    canvasTools.model = new GridModel(
        Constants.STARTING_VALUES.CANVAS_DIMENSIONS);

    var defaultElement = { color: Constants.STARTING_VALUES.DEFAULT_COLOR };
    var activeElement = { color: Constants.STARTING_VALUES.ACTIVE_COLOR };
    canvasTools.modelBuilder = new GridModelBuilder(
        canvasTools.model, canvasTools.pixelCanvas, defaultElement,
        activeElement, SpriteConverter);

    this._actions.activeColor.addValueChangeHandler(function (value) {
      canvasTools.modelBuilder.setCurrentElement({ color: value });
    });
    this._actions.defaultColor.addValueChangeHandler(function (value) {
      canvasTools.modelBuilder.setDefaultElement({ color: value });
    });
    this._actions.currentTool.addValueChangeHandler(function (value) {
      canvasTools.modelBuilder.setAction(Constants.TOOL_TO_ACTION_MAP[value]);
    });

    canvasTools.modelBuilder.afterCanvasAction(function () {
      if (app._actions.currentTool.getValue() ===
          Constants.AVAILABLE_TOOLS.DROPPER) {
        app._actions.activeColor.setValue(
           canvasTools.modelBuilder.getCurrentElement().color);
      }
    });

    EventHub.subscribe('modelbuilder.redraw', function () {
      canvasTools.clickInterface.paintGrid();
    });

    this._sizeCanvas();

    return canvasTools;
  };


  // _initalizeDefaultColorSelectRouting connects all of the components of the 
  // default color select menu.
  PixelEditor.prototype._initializeDefaultColorSelectRouting = function () {
    var $colorSelectPreview =
        $('#default-color-select-menu').find('.color-select-preview');
    var $colorSelectInput =
        $('#default-color-select-menu').find('.color-select-text-input');
    var $defaultColorIcon =
      $('#default-color-button').find('.icon-default-color');
    var $colorPaletteColors =
        $('#default-color-select-menu').find('.color-palette-color');
    var app = this;

    $colorSelectInput.on('keyup', function (e) {
      app._actions.defaultColor.setValue($colorSelectInput.val());
      if (e.which === Constants.KEYS.ENTER) {
        app._palettes.defaultColorSelect.visible(false);
      }
    });

    this._actions.defaultColor.addValueChangeHandler(function (newColor) {
      $defaultColorIcon.css('color', newColor);
      $colorSelectPreview.css('background-color', newColor);

      var inputVal = $colorSelectInput.val();
      if (!Color.isValid(inputVal) || (Color.sanitize(inputVal) !== newColor)) {
        $colorSelectInput.val(newColor);
      }
    });

    this._buttons.toolbar.defaultColor.addStateHandler(function (state) {
      app._palettes.defaultColorSelect.visible(state);
    });

    _.each(this._buttons.defaultColorSelect.colorPalette, function (button, i) {
      button.addClickHandler(function () {
        var colors = app._actions.recentColors.getPalette();
        app._actions.defaultColor.setValue(colors[i]);
      });
    });

    this._palettes.defaultColorSelect.addVisibleStateHandler(
        function (isVisible) {
      if (!isVisible) {
        app._actions.recentColors.colorUsed(
            app._actions.defaultColor.getValue());
      }
      else {
        var colors = app._actions.recentColors.getPalette();
        $colorPaletteColors.each(function (index) {
          if (colors[index]) {
            $(this).css({
              'background-color': colors[index],
              'display': ''
            });
          }
          else $(this).css('display', 'none');
        });
      }
    });

    // Set initial values
    this._actions.defaultColor.setValue(
        Constants.STARTING_VALUES.DEFAULT_COLOR);
    this._actions.recentColors.colorUsed(
        Constants.STARTING_VALUES.DEFAULT_COLOR);
  };


  // initializePalettes sets up the Palette menus on the page.
  // Returns an object containing named palettes.
  PixelEditor.prototype._initializePalettes = function () {
    var palettes = Object.create(null);

    palettes.toolSelect = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#tool-select-menu',
      sibling: '#tool-select-button'
    });
    this._buttons.toolbar.toolSelect.addStateHandler(function (state) {
      palettes.toolSelect.visible(state);
    });

    palettes.activeColorSelect = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#active-color-select-menu',
      sibling: '#active-color-button'
    });

    palettes.defaultColorSelect = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#default-color-select-menu',
      sibling: '#default-color-button'
    });
    this._buttons.toolbar.defaultColor.addStateHandler(function (state) {
      palettes.defaultColorSelect.visible(state);
    });

    palettes.trash = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#trash-confirmation-menu',
      sibling: '#trash-button'
    });
    this._buttons.toolbar.trash.addStateHandler(function (state) {
      palettes.trash.visible(state);
    });

    return palettes;
  };


  // _initializePlaceholder behavior of the application.
  PixelEditor.prototype._initializePlaceholder = function () {
    var app = this;

    $(document).bind('keydown', function (e) {
      // If the escape key was pressed clear toolbar selection.
      if (e.which === Constants.KEYS.ESCAPE) {
        app._radioGroups.toolbar.clear();
      }
    });

    $(window).bind('resize', function () {
      app._sizeCanvas();
      app._canvasTools.modelBuilder.paint();
    });
  };


  // _initializeRadioGroups sets up the radio groups of buttons on the page.
  // Returns an object containing named radio groups.
  PixelEditor.prototype._initializeRadioGroups = function () {
    var radioGroups = Object.create(null);

    radioGroups.toolbar = new RadioGroup(_.values(_.omit(
        this._buttons.toolbar, ['undo', 'redo'])));

    var toolSelectButtons = [
      this._buttons.toolSelectMenu.paintBrush,
      this._buttons.toolSelectMenu.dropper,
      this._buttons.toolSelectMenu.paintBucket,
      this._buttons.toolSelectMenu.eraser,
    ];
    radioGroups.toolSelect = new RadioGroup(
      toolSelectButtons, 0 /* activeIndex */);

    return radioGroups;
  };


  // Update the size of the canvas to match the size of the parent container.
  // Arguments:
  //   $canvas: The jQuery object for the canvas that must be sized
  PixelEditor.prototype._sizeCanvas  = function () {
    if (this._$canvas[0].width !== this._$canvas.parent().width() ||
        this._$canvas[0].height !== this._$canvas.parent().height()){
      this._$canvas[0].width = this._$canvas.parent().width();
      this._$canvas[0].height = this._$canvas.parent().height();
    }
  };


  // _initializeToolSelectRouting connects all components required for the
  // tool select algorithm.
  PixelEditor.prototype._initializeToolSelectRouting = function () {
    var app = this;
    var $currentToolIcon = $('#tool-select-button').find('.toolbar-icon');
    var $selectPaintBrushButton = $('#select-paint-brush-button');
    var $selectDropperButton = $('#select-dropper-button');
    var $selectPaintBucketButton = $('#select-paint-bucket-button');
    var $selectEraserButton = $('#select-eraser-button');

    this._buttons.toolSelectMenu.paintBrush.addStateHandler(
        function (toggled) {
      $selectPaintBrushButton.removeClass('dk-palette-appear-transition');
      $selectPaintBrushButton.removeClass('dk-palette-disappear-transition');
      if (toggled) {
        app._actions.currentTool.setValue(Constants.AVAILABLE_TOOLS.PAINTBRUSH);
      }
    });
    this._buttons.toolSelectMenu.dropper.addStateHandler(
        function (toggled) {
      $selectDropperButton.removeClass('dk-palette-appear-transition');
      $selectDropperButton.removeClass('dk-palette-disappear-transition');
      if (toggled) {
        app._actions.currentTool.setValue(Constants.AVAILABLE_TOOLS.DROPPER);
      }
    });
    this._buttons.toolSelectMenu.paintBucket.addStateHandler(
        function (toggled) {
      $selectPaintBucketButton.removeClass('dk-palette-appear-transition');
      $selectPaintBucketButton.removeClass('dk-palette-disappear-transition');
      if (toggled) {
        app._actions.currentTool.setValue(
            Constants.AVAILABLE_TOOLS.PAINTBUCKET);
      }
    });
    this._buttons.toolSelectMenu.eraser.addStateHandler(
        function (toggled) {
      $selectEraserButton.removeClass('dk-palette-appear-transition');
      $selectEraserButton.removeClass('dk-palette-disappear-transition');
      if (toggled) {
        app._actions.currentTool.setValue(Constants.AVAILABLE_TOOLS.ERASER);
      }
    });

    this._actions.currentTool.addValueChangeHandler(function (value) {
      _.each(_.values(Constants.TOOL_ICON_CLASSES), function (cls) {
        $currentToolIcon.removeClass(cls);
      });

      $currentToolIcon.addClass(Constants.TOOL_ICON_CLASSES[value]);
    });
  };


  return PixelEditor;
});
