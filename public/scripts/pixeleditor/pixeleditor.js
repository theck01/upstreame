define(
    ['jquery', 'underscore', 'domkit/controllers/radiogroup',
     'domkit/ui/button', 'domkit/ui/palette', 'core/graphics/color',
     'core/graphics/pixelcanvas', 'pixeleditor/constants',
     'pixeleditor/actions/recentcolorpalette', 'pixeleditor/actions/value'],
    function (
        $, _, RadioGroup, Button, Palette, Color, PixelCanvas, Constants,
        RecentColorPalette, Value) {
  // Base application initializer.
  var PixelEditor = function () {
    this._$canvas = $('#pixel-editor-canvas');

    this._actions = this._initializeActions();
    this._buttons = this._initializeButtons();
    this._pixelCanvas = this._initializeCanvas();
    this._radioGroups = this._initializeRadioGroups();
    this._palettes = this._initializePalettes();
    this._initializeActiveColorSelectRouting();
    this._initializeDefaultColorSelectRouting();

    this._initializePlaceholder();
  };


  // _initializeActions
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

    $colorSelectInput.on('keyup', function () {
      app._actions.activeColor.setValue($colorSelectInput.val());
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
    this._sizeCanvas();
    return new PixelCanvas(
        { width: 130, height: 100 }, '#pixel-editor-canvas', '#000000');
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

    $colorSelectInput.on('keyup', function () {
      app._actions.defaultColor.setValue($colorSelectInput.val());
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


  // tmp_drawCanvas temporary function draws an image on the canvas.
  function tmp_drawCanvas (pixelCanvas, image) {
    _.each(image.pixels, function (p) {
      pixelCanvas.setPixel(p.x, p.y, p.color);
    });

    pixelCanvas.paint();
  }


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
    var splashScreen;
    $.ajax({
      url: '/sprite/splash-screen',
      type: 'GET',
      dataType: 'text',
      success: function (data) {
        splashScreen = JSON.parse(data);
        tmp_drawCanvas(app._pixelCanvas, splashScreen);
      }
    });

    $(document).bind('keydown', function (e) {
      // If the escape key was pressed clear toolbar selection.
      if (e.which === 27) {
        app._radioGroups.toolbar.clear();
      }
    });

    $(window).bind('resize', function () {
      app._sizeCanvas();
      tmp_drawCanvas(app._pixelCanvas, splashScreen);
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

  return PixelEditor;
});
