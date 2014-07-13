require.config({
  baseUrl: 'scripts',
  packages: [{
    location: '/domkit/domkit',
    name: 'domkit',
    main: 'domkit'
  }],
  paths: {
    jquery: '/jquery/jquery.min',
    underscore: '/underscore-amd/underscore-min'
  }
});


require(
    ['jquery', 'underscore', 'domkit/controllers/radiogroup',
     'domkit/ui/button', 'domkit/ui/palette', 'core/graphics/color',
     'core/graphics/pixelcanvas', 'pixeleditor/constants',
     'pixeleditor/actions/actionhub'],
    function (
        $, _, RadioGroup, Button, Palette, Color, PixelCanvas, Constants,
        ActionHub) {

  // initalizeActiveColorSelectRouting connects all of the components of the 
  // active color collect menu.
  function initializeActiveColorSelectRouting (buttons, palettes) {
    var $colorSelectPreview =
        $('#active-color-select-menu').find('.color-select-preview');
    var $colorSelectInput =
        $('#active-color-select-menu').find('.color-select-text-input');
    var $activeColorIcon = $('#active-color-button').find('.icon-active-color');
    var $colorPaletteColors =
        $('#active-color-select-menu').find('.color-palette-color');

    $colorSelectInput.on('keyup', function () {
      ActionHub.activeColor.setValue($colorSelectInput.val());
    });

    ActionHub.activeColor.addValueChangeHandler(function (newColor) {
      $activeColorIcon.css('color', newColor);
      $colorSelectPreview.css('background-color', newColor);

      var inputVal = $colorSelectInput.val();
      if (!Color.isValid(inputVal) || (Color.sanitize(inputVal) !== newColor)) {
        $colorSelectInput.val(newColor);
      }
    });

    buttons.toolbar.activeColor.addStateHandler(function (state) {
      palettes.activeColorSelect.visible(state);
    });

    _.each(buttons.activeColorSelect.colorPalette, function (button, i) {
      button.addClickHandler(function () {
        var colors = ActionHub.recentColors.getPalette();
        ActionHub.activeColor.setValue(colors[i]);
      });
    });

    palettes.activeColorSelect.addVisibleStateHandler(
        function (isVisible) {
      if (!isVisible) {
        ActionHub.recentColors.colorUsed(ActionHub.activeColor.getValue());
      }
      else {
        var colors = ActionHub.recentColors.getPalette();
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
    ActionHub.activeColor.setValue(Constants.STARTING_VALUES.ACTIVE_COLOR);
    ActionHub.recentColors.colorUsed(Constants.STARTING_VALUES.ACTIVE_COLOR);
  }


  // initalizeDefaultColorSelectRouting connects all of the components of the 
  // default color select menu.
  function initializeDefaultColorSelectRouting (buttons, palettes) {
    var $colorSelectPreview =
        $('#default-color-select-menu').find('.color-select-preview');
    var $colorSelectInput =
        $('#default-color-select-menu').find('.color-select-text-input');
    var $defaultColorIcon =
      $('#default-color-button').find('.icon-default-color');
    var $colorPaletteColors =
        $('#default-color-select-menu').find('.color-palette-color');

    $colorSelectInput.on('keyup', function () {
      ActionHub.defaultColor.setValue($colorSelectInput.val());
    });

    ActionHub.defaultColor.addValueChangeHandler(function (newColor) {
      $defaultColorIcon.css('color', newColor);
      $colorSelectPreview.css('background-color', newColor);

      var inputVal = $colorSelectInput.val();
      if (!Color.isValid(inputVal) || (Color.sanitize(inputVal) !== newColor)) {
        $colorSelectInput.val(newColor);
      }
    });

    buttons.toolbar.defaultColor.addStateHandler(function (state) {
      palettes.defaultColorSelect.visible(state);
    });

    _.each(buttons.defaultColorSelect.colorPalette, function (button, i) {
      button.addClickHandler(function () {
        var colors = ActionHub.recentColors.getPalette();
        ActionHub.defaultColor.setValue(colors[i]);
      });
    });

    palettes.defaultColorSelect.addDelayedVisibleStateHandler(
        function (isVisible) {
      if (!isVisible) {
        ActionHub.recentColors.colorUsed(ActionHub.defaultColor.getValue());
      }
    });

    palettes.defaultColorSelect.addVisibleStateHandler(
        function (isVisible) {
      if (!isVisible) {
        ActionHub.recentColors.colorUsed(ActionHub.defaultColor.getValue());
      }
      else {
        var colors = ActionHub.recentColors.getPalette();
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
    ActionHub.defaultColor.setValue(Constants.STARTING_VALUES.DEFAULT_COLOR);
    ActionHub.recentColors.colorUsed(Constants.STARTING_VALUES.DEFAULT_COLOR);
  }


  // initializeButtons initializes all domkit buttons and returns button
  // instances in an object with buttons namespaced to location in the view.
  function initializeButtons () {
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
  }


  // initializeCanvas sets up the pixel canvas
  // Arguments:
  //   $canvas: jQuery object for the canvas.
  // Returns an instance of a PixelCanvas.
  function initializeCanvas ($canvas) {
    sizeCanvas($canvas);
    return new PixelCanvas(
        { width: 130, height: 100 }, '#pixel-editor-canvas', '#000000');
  }


  // tmp_drawCanvas temporary function draws an image on the canvas.
  function tmp_drawCanvas (pixelCanvas, image) {
    _.each(image.pixels, function (p) {
      pixelCanvas.setPixel(p.x, p.y, p.color);
    });

    pixelCanvas.paint();
  }


  // initializeRadioGroups sets up the radio groups of buttons on the page.
  // Arguments:
  //   buttons: Buttons object generated by intializeButtons
  // Returns an object containing named radio groups.
  function initializeRadioGroups (buttons) {
    var radioGroups = Object.create(null);

    radioGroups.toolbar = new RadioGroup(_.values(_.omit(
        buttons.toolbar, ['undo', 'redo'])));

    var toolSelectButtons = [
      buttons.toolSelectMenu.paintBrush, buttons.toolSelectMenu.dropper,
      buttons.toolSelectMenu.paintBucket, buttons.toolSelectMenu.eraser,
    ];
    radioGroups.toolSelect = new RadioGroup(
      toolSelectButtons, 0 /* activeIndex */);

    return radioGroups;
  }

  // initializePalettes sets up the Palette menus on the page.
  // Arguments:
  //   buttons: Buttons object generated by intializeButtons
  // Returns an object containing named palettes.
  function initializePalettes (buttons) {
    var palettes = Object.create(null);

    palettes.toolSelect = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#tool-select-menu',
      sibling: '#tool-select-button'
    });
    buttons.toolbar.toolSelect.addStateHandler(function (state) {
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
    buttons.toolbar.defaultColor.addStateHandler(function (state) {
      palettes.defaultColorSelect.visible(state);
    });

    palettes.trash = new Palette({
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      anchorEdgeBounds: { min: 0, max: $(window).height() },
      menu: '#trash-confirmation-menu',
      sibling: '#trash-button'
    });
    buttons.toolbar.trash.addStateHandler(function (state) {
      palettes.trash.visible(state);
    });

    return palettes;
  }


  // Update the size of the canvas to match the size of the parent container.
  // Arguments:
  //   $canvas: The jQuery object for the canvas that must be sized
  function sizeCanvas ($canvas) {
    if ($canvas[0].width !== $canvas.parent().width() ||
        $canvas[0].height !== $canvas.parent().height()){
      $canvas[0].width = $canvas.parent().width();
      $canvas[0].height = $canvas.parent().height();
    }
  }


  // onload -- main
  $(function () {
    var $canvas = $('#pixel-editor-canvas');

    var buttons = initializeButtons();
    var radioGroups = initializeRadioGroups(buttons);
    var palettes = initializePalettes(buttons);
    initializeActiveColorSelectRouting(buttons, palettes);
    initializeDefaultColorSelectRouting(buttons, palettes);

    var splashScreen;
    var pixelCanvas;
    $.ajax({
      url: '/sprite/splash-screen',
      type: 'GET',
      dataType: 'text',
      success: function (data) {
        splashScreen = JSON.parse(data);
        pixelCanvas = initializeCanvas($canvas);
        tmp_drawCanvas(pixelCanvas, splashScreen);
      }
    });

    $(document).bind('keydown', function (e) {
      // If the escape key was pressed clear toolbar selection.
      if (e.which === 27) {
        radioGroups.toolbar.clear();
      }
    });

    $(window).bind('resize', function () {
      sizeCanvas($canvas);
      tmp_drawCanvas(pixelCanvas, splashScreen);
    });
  });
});
