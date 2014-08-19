define(
    ['jquery', 'underscore', 'domkit/controllers/radiogroup',
     'domkit/ui/button', 'domkit/ui/palette',
     'core/controller/eventhub', 'core/graphics/color',
     'pixeleditor/controller/gridmodelbuilder',
     'pixeleditor/graphics/editablecanvas',
     'pixeleditor/interface/metapixelclickinterface',
     'pixeleditor/model/converters/spriteconverter',
     'pixeleditor/model/gridmodel', 'pixeleditor/constants',
     'pixeleditor/actions/recentcolorpalette', 'pixeleditor/actions/value'],
    function (
        $, _, RadioGroup, Button, Palette, EventHub, Color, GridModelBuilder,
        EditableCanvas, MetaPixelClickInterface, SpriteConverter, GridModel,
        Constants, RecentColorPalette, Value) {
  // Base application initializer.
  var PixelEditor = function () {
    this._$canvas = $('#pixel-editor-canvas');
    this._$bottomToolbar = $('#bottom-toolbar');

    this._actions = this._initializeActions();
    this._buttons = this._initializeButtons();
    this._canvasTools = this._initializeCanvas();
    this._radioGroups = this._initializeRadioGroups();
    this._palettes = this._initializePalettes();

    this._initializeActiveColorSelectRouting();
    this._initializeDefaultColorSelectRouting();
    this._initializeSessionsRouting();
    this._initializeSettingsRouting();
    this._initializeToolSelectRouting();
    this._initializeTrashRouting();

    this._initializeGlobal();
  };


  // _initializeActions initializes all of the actions in the application.
  // Returns an object mapping action names to actions.
  PixelEditor.prototype._initializeActions = function () {
    var colorValidator = function (newColorObj) {
      if (newColorObj && Color.isValid(newColorObj.color)) {
        return { color: Color.sanitize(newColorObj.color) };
      }
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

    var dimensionValidator = function (newDimensions) {
      if (!newDimensions) return null;
      var sanitizedDimensions = _.pick(newDimensions, 'width', 'height');
      if (!isNaN(sanitizedDimensions.width) &&
          !isNaN(sanitizedDimensions.height)) {
        return sanitizedDimensions;
      }
      return null;
    };


    var booleanValidator = function (newLogicalValue) {
      return !!newLogicalValue;
    };

    var actions = Object.create(null);
    actions.activeColor = new Value(null, colorValidator);
    actions.defaultColor = new Value(null, colorValidator);
    actions.recentColors =
        new RecentColorPalette(Constants.COLOR_PALETTE_SIZE);
    actions.currentTool =
        new Value(Constants.AVAILABLE_TOOLS, toolValidator);
    actions.canvasDimensions = new Value(null, dimensionValidator);
    actions.canvasGridDisplay = new Value(null, booleanValidator);
    actions.userLoggedIn = new Value(false, booleanValidator);

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
      app._actions.activeColor.setValue({ color: $colorSelectInput.val() });
      if (e.which === Constants.KEYS.ENTER) {
        app._palettes.topToolbar.activeColorSelect.visible(false);
      }
    });

    this._actions.activeColor.addValueChangeHandler(function (newColorObj) {
      $activeColorIcon.css('color', newColorObj.color);
      $colorSelectPreview.css('background-color', newColorObj.color);

      var inputVal = $colorSelectInput.val();
      if (!Color.isValid(inputVal) ||
          (Color.sanitize(inputVal) !== newColorObj.color)) {
        $colorSelectInput.val(newColorObj.color);
      }
    });

    _.each(this._buttons.activeColorSelect.colorPalette, function (button, i) {
      button.addClickHandler(function () {
        var colors = app._actions.recentColors.getPalette();
        app._actions.activeColor.setValue({ color: colors[i] });
      });
    });

    this._palettes.topToolbar.activeColorSelect.addVisibleStateHandler(
        function (isVisible) {
      if (!isVisible) {
        app._actions.recentColors.colorUsed(
            app._actions.activeColor.getValue().color);
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
    this._actions.activeColor.setValue(
        { color: Constants.STARTING_VALUES.ACTIVE_COLOR });
    this._actions.recentColors.colorUsed(
        Constants.STARTING_VALUES.ACTIVE_COLOR);
    $colorSelectInput.val('');
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
    buttons.toolSelectMenu.zoom = Button.create('#select-zoom-button');
    buttons.toolSelectMenu.crop = Button.create('#select-crop-button');

    buttons.trashMenu = Object.create(null);
    buttons.trashMenu.yes = Button.create('#trash-confirm-yes');
    buttons.trashMenu.no = Button.create('#trash-confirm-no');

    buttons.loadMenu = Object.create(null);
    buttons.loadMenu.load = Button.create('#load-sprite-button');

    buttons.saveMenu = Object.create(null);
    buttons.saveMenu.save = Button.create('#save-sprite-button');

    buttons.loginMenu = Object.create(null);
    buttons.loginMenu.login = Button.create('#login-button');
    buttons.logoutMenu = Object.create(null);
    buttons.logoutMenu.yes = Button.create('#logout-confirm-yes');
    buttons.logoutMenu.no = Button.create('#logout-confirm-no');

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
    var canvasTools = Object.create(null);

    canvasTools.canvas = new EditableCanvas(
        Constants.STARTING_VALUES.CANVAS_DIMENSIONS, '#pixel-editor-canvas',
        Constants.STARTING_VALUES.DEFAULT_COLOR);

    canvasTools.model = new GridModel(
        Constants.STARTING_VALUES.CANVAS_DIMENSIONS);

    canvasTools.modelBuilder = new GridModelBuilder(
        canvasTools.model, canvasTools.canvas, this._actions.defaultColor,
        this._actions.activeColor, this._actions.canvasDimensions,
        SpriteConverter);

    canvasTools.clickInterface = new MetaPixelClickInterface(
        canvasTools.canvas, canvasTools.modelBuilder);

    this._actions.currentTool.addValueChangeHandler(function (value) {
      canvasTools.modelBuilder.setAction(Constants.TOOL_TO_ACTION_MAP[value]);
    });

    this._buttons.toolbar.undo.addClickHandler(function () {
      canvasTools.modelBuilder.undo();
    });
    this._buttons.toolbar.redo.addClickHandler(function () {
      canvasTools.modelBuilder.redo();
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
      app._actions.defaultColor.setValue({ color: $colorSelectInput.val() });
      if (e.which === Constants.KEYS.ENTER) {
        app._palettes.topToolbar.defaultColorSelect.visible(false);
      }
    });

    this._actions.defaultColor.addValueChangeHandler(function (newColorObj) {
      $defaultColorIcon.css('color', newColorObj.color);
      $colorSelectPreview.css('background-color', newColorObj.color);

      var inputVal = $colorSelectInput.val();
      if (!Color.isValid(inputVal) ||
          (Color.sanitize(inputVal) !== newColorObj.color)) {
        $colorSelectInput.val(newColorObj.color);
      }
    });

    _.each(this._buttons.defaultColorSelect.colorPalette, function (button, i) {
      button.addClickHandler(function () {
        var colors = app._actions.recentColors.getPalette();
        app._actions.defaultColor.setValue({ color: colors[i] });
      });
    });

    this._palettes.topToolbar.defaultColorSelect.addVisibleStateHandler(
        function (isVisible) {
      if (!isVisible) {
        app._actions.recentColors.colorUsed(
            app._actions.defaultColor.getValue().color);
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
        { color: Constants.STARTING_VALUES.DEFAULT_COLOR });
    this._actions.recentColors.colorUsed(
        Constants.STARTING_VALUES.DEFAULT_COLOR);
    $colorSelectInput.val('');
  };


  // initializePalettes sets up the Palette menus on the page.
  // Returns an object containing named palettes.
  PixelEditor.prototype._initializePalettes = function () {
    var palettes = Object.create(null);
    palettes.topToolbar = Object.create(null);
    palettes.bottomToolbar = Object.create(null);
    var app = this;

    palettes.topToolbar.toolSelect = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#tool-select-menu',
      sibling: '#tool-select-button'
    });
    this._buttons.toolbar.toolSelect.addStateHandler(function (state) {
      palettes.topToolbar.toolSelect.visible(state);
    });

    palettes.topToolbar.activeColorSelect = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#active-color-select-menu',
      sibling: '#active-color-button'
    });
    this._buttons.toolbar.activeColor.addStateHandler(function (state) {
      palettes.topToolbar.activeColorSelect.visible(state);
    });

    palettes.topToolbar.defaultColorSelect = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#default-color-select-menu',
      sibling: '#default-color-button'
    });
    this._buttons.toolbar.defaultColor.addStateHandler(function (state) {
      palettes.topToolbar.defaultColorSelect.visible(state);
    });

    palettes.topToolbar.trash = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#trash-confirmation-menu',
      sibling: '#trash-button'
    });
    this._buttons.toolbar.trash.addStateHandler(function (state) {
      palettes.topToolbar.trash.visible(state);
    });

    var $bottomToolbar = $('#bottom-toolbar');
    var bottomToolbarAnchorEdgeBounds = {
      min: -$bottomToolbar.position().top,
      max: $bottomToolbar.outerHeight()
    };

    palettes.bottomToolbar.load = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: bottomToolbarAnchorEdgeBounds,
      menu: '#load-sprite-menu',
      sibling: '#load-button'
    });
    this._buttons.toolbar.load.addStateHandler(function (state) {
      palettes.bottomToolbar.load.visible(state);
    });

    palettes.bottomToolbar.save = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: bottomToolbarAnchorEdgeBounds,
      menu: '#save-sprite-menu',
      sibling: '#save-button'
    });
    this._buttons.toolbar.save.addStateHandler(function (state) {
      palettes.bottomToolbar.save.visible(state);
    });

    palettes.bottomToolbar.settings = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: bottomToolbarAnchorEdgeBounds,
      menu: '#settings-menu',
      sibling: '#settings-button'
    });
    this._buttons.toolbar.settings.addStateHandler(function (state) {
      palettes.bottomToolbar.settings.visible(state);
    });

    palettes.bottomToolbar.login = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: bottomToolbarAnchorEdgeBounds,
      menu: '#login-menu',
      sibling: '#session-button'
    });
    palettes.bottomToolbar.logout = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: bottomToolbarAnchorEdgeBounds,
      menu: '#logout-menu',
      sibling: '#session-button'
    });
    this._buttons.toolbar.session.addStateHandler(function (state) {
      if (app._actions.userLoggedIn.getValue()) {
        palettes.bottomToolbar.login.visible(false);
        palettes.bottomToolbar.logout.visible(state);
      }
      else {
        palettes.bottomToolbar.login.visible(state);
        palettes.bottomToolbar.logout.visible(false);
      }
    });

    return palettes;
  };


  // _initializeGlobal behavior of the application.
  PixelEditor.prototype._initializeGlobal = function () {
    var app = this;

    $('#pixel-editor-canvas').bind('mousedown', function() {
      app._radioGroups.toolbar.clear();
    });

    $(document).bind('keydown', function (e) {
      // If the escape key was pressed clear toolbar selection.
      if (e.which === Constants.KEYS.ESCAPE) {
        app._radioGroups.toolbar.clear();
      }
    });

    $(window).bind('resize', function () {
      app._sizeCanvas();
      app._recalculatePaletteBounds();
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
      this._buttons.toolSelectMenu.zoom,
      this._buttons.toolSelectMenu.crop
    ];
    radioGroups.toolSelect = new RadioGroup(
      toolSelectButtons, 0 /* activeIndex */);

    return radioGroups;
  };


  // _initializeSessionsRouting connects all components required for the 
  // login and logout menus.
  PixelEditor.prototype._initializeSessionsRouting = function () {
    var $sessionButtonIcon = $('#session-button').find('.toolbar-icon');
    var app = this;

    this._buttons.loginMenu.login.addClickHandler(function () {
      app._actions.userLoggedIn.setValue(true);
      app._radioGroups.toolbar.clear();
    });
    this._buttons.logoutMenu.yes.addClickHandler(function () {
      app._actions.userLoggedIn.setValue(false);
      app._radioGroups.toolbar.clear();
    });
    this._buttons.logoutMenu.no.addClickHandler(function () {
      app._radioGroups.toolbar.clear();
    });

    this._actions.userLoggedIn.addValueChangeHandler(function (isLoggedIn) {
      if (isLoggedIn) {
        $sessionButtonIcon.addClass('icon-logout');
        $sessionButtonIcon.removeClass('icon-login');
      }
      else {
        $sessionButtonIcon.addClass('icon-login');
        $sessionButtonIcon.removeClass('icon-logout');
      }
    });
  };


  // _initializeSettingsRouting connects all components required for the 
  // settings menu.
  PixelEditor.prototype._initializeSettingsRouting = function () {
    var $canvasWidthInput = $('#canvas-width-input');
    var $canvasHeightInput = $('#canvas-height-input');
    var $gridDisplayInput = $('#grid-display-input');
    var app = this;

    $canvasWidthInput.on('keyup', function () {
      var dimensions = app._actions.canvasDimensions.getValue();
      app._actions.canvasDimensions.setValue({
        width: parseInt($canvasWidthInput.val(), 10),
        height: dimensions.height
      });
    });

    $canvasHeightInput.on('keyup', function () {
      var dimensions = app._actions.canvasDimensions.getValue();
      app._actions.canvasDimensions.setValue({
        width: dimensions.width,
        height: parseInt($canvasHeightInput.val(), 10)
      });
    });

    var dimensionChangeHandler = function () {
      app._canvasTools.modelBuilder.resize(
          app._actions.canvasDimensions.getValue());
    };
    this._actions.canvasDimensions.addValueChangeHandler(
        dimensionChangeHandler);

    $gridDisplayInput.on('change', function () {
      app._actions.canvasGridDisplay.setValue(
          $gridDisplayInput.prop('checked'));
    });

    // Set initial values
    this._actions.canvasDimensions.setValue({
      width: Constants.STARTING_VALUES.CANVAS_DIMENSIONS.width,
      height: Constants.STARTING_VALUES.CANVAS_DIMENSIONS.height
    });
    $canvasWidthInput.val(Constants.STARTING_VALUES.CANVAS_DIMENSIONS.width);
    $canvasHeightInput.val(Constants.STARTING_VALUES.CANVAS_DIMENSIONS.height);
    this._actions.canvasGridDisplay.setValue(
        Constants.STARTING_VALUES.CANVAS_DIMENSIONS.GRID_VISIBLE);
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
  // tool select menu.
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
    this._buttons.toolSelectMenu.zoom.addStateHandler(
        function (toggled) {
      $selectEraserButton.removeClass('dk-palette-appear-transition');
      $selectEraserButton.removeClass('dk-palette-disappear-transition');
      if (toggled) {
        app._actions.currentTool.setValue(Constants.AVAILABLE_TOOLS.ZOOM);
      }
    });
    this._buttons.toolSelectMenu.crop.addStateHandler(
        function (toggled) {
      $selectEraserButton.removeClass('dk-palette-appear-transition');
      $selectEraserButton.removeClass('dk-palette-disappear-transition');
      if (toggled) {
        app._actions.currentTool.setValue(Constants.AVAILABLE_TOOLS.CROP);
      }
    });

    this._actions.currentTool.addValueChangeHandler(function (value) {
      _.each(_.values(Constants.TOOL_ICON_CLASSES), function (cls) {
        $currentToolIcon.removeClass(cls);
      });

      $currentToolIcon.addClass(Constants.TOOL_ICON_CLASSES[value]);
    });
  };


  // _initializeTrashRouting connects components of the trash submenu.
  PixelEditor.prototype._initializeTrashRouting = function () {
    var app = this;

    this._buttons.trashMenu.yes.addClickHandler(function () {
      app._radioGroups.toolbar.clear();
      app._canvasTools.modelBuilder.clear();
    });
    this._buttons.trashMenu.no.addClickHandler(function () {
      app._radioGroups.toolbar.clear();
    });
  };


  // _recalculatePaletteBounds recalculates and sets the bounding range for the
  // palette menus in the application.
  PixelEditor.prototype._recalculatePaletteBounds = function () {
    var topToolbarAnchorEdgeBounds = { min: 0, max: $(window).height() };
    var bottomToolbarAnchorEdgeBounds = {
      min: -this._$bottomToolbar.position().top,
      max: this._$bottomToolbar.outerHeight()
    };

    _.each(_.values(this._palettes.topToolbar), function (p) {
      p.bound(topToolbarAnchorEdgeBounds);
    });
    _.each(_.values(this._palettes.bottomToolbar), function (p) {
      p.bound(bottomToolbarAnchorEdgeBounds);
    });
  };

  return PixelEditor;
});
