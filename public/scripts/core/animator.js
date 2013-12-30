require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "/jquery/jquery.min",
		typeahead: "/typeahead.js/dist/typeahead.min",
    underscore: "/underscore-amd/underscore-min"
  },
  shim: {
    bootstrap: {
      deps: ["jquery"]
    }
  }
});


require(["jquery", "underscore", "core/graphics/color",
         "core/graphics/pixelcanvas", "core/graphics/spritearchive",
         "core/interface/statusalert", "core/util/frameclock", "bootstrap",
         "core/interface/toollayoutloginform"],
  function ($, _, Color, PixelCanvas, SpriteArchive, StatusAlert, FrameClock) {

    // persistent state variables
    var backgroundColor = "#FFFFFF";
    var dimensions = { width: 64, height: 64 };
    var frameRate = 3;
    var frameClock = new FrameClock();
    var pixelArtCanvas;
    var scheduledFrame = null;

    // persistent UI variables
    var $backgroundColorInput;
    var $backgroundColorPreview;
    var $canvas;
    var $framesPerSpriteInput;
    var $pixelHeight;
    var $pixelWidth;
    var $playButton;
    var $refreshButton;
    var $repeatToggle;
    var $spriteNameInput;
    var $spriteAddButton;
    var $spriteList;
    var $stopButton;


    function createListElement(spriteName) {
      var $listElement = $("<li/>", { "class": "input-group" });

      var $nameBox = $("<input/>", {
        "class": "form-control",
        type: "text"
      });
      $nameBox.val(spriteName);

      var $deleteSpan = $("<span/>", { "class": "input-group-btn" });
      var $deleteButton = $("<div/>", {
        "class": "btn btn-primary",
        click: function () {
          $listElement.remove();
        }
      });

      var $deleteIcon = $("<i/>", { "class": "icon-remove" });

      $deleteButton.append($deleteIcon);
      $deleteSpan.append($deleteButton);
      $listElement.append($nameBox, $deleteSpan);

      return $listElement;
    }


    function displayFrame($listItem) {
      var spriteName = $listItem.children(".form-control").val();
      var sprite = SpriteArchive.get(spriteName);
      
      if (sprite) {
        sprite.paintOn(pixelArtCanvas, { x: Math.floor(dimensions.width/2),
                                         y: Math.floor(dimensions.height/2) });
      }
      pixelArtCanvas.paint();

      if ($listItem.next().length > 0) {
        scheduledFrame = frameClock.schedule(function () {
          displayFrame($listItem.next());
        }, frameRate);
      }
      else if ($repeatToggle.hasClass("active")) {
        scheduledFrame = frameClock.schedule(function () {
          displayFrame($spriteList.children().first());
        }, frameRate);
      }
      else scheduledFrame = null;
    }


    function sizeCanvas() {
      if ($canvas[0].width !== $canvas.parent().width() ||
          $canvas[0].height !== $canvas.parent().height()){
        $canvas[0].width = $canvas.parent().width();
        $canvas[0].height = $canvas.parent().height();
      }
    }

    function timeStep() {
      frameClock.tick();
      requestAnimationFrame(timeStep);
    }

    function loadSprites() {
      $.ajax({
        url: "/sprite/all",
        type: "GET",
        dataType: "json",
        success: function (data) {
          SpriteArchive.load(data);
          $spriteNameInput.typeahead("destroy");
          $spriteNameInput.typeahead({ autoselect: "first",
                                       local: _.keys(data) });
        },
        error: function (jqXHR) {
          console.log("Could not load sprites: " + jqXHR.status + "error");
        }
      });
    }


    $(function () {

      // initialize all variables
      $backgroundColorInput = $("#background-color-input");
      $backgroundColorPreview = $("#background-color-preview");
      $canvas = $("#animation-canvas");
      $framesPerSpriteInput = $("#frames-per-sprite-input");
      $pixelHeight = $("#pixel-height-input");
      $pixelWidth = $("#pixel-width-input");
      $playButton = $("#play-button");
      $refreshButton = $("#refresh-button");
      $repeatToggle = $("#repeat-toggle");
      $spriteNameInput = $("#sprite-name-input");
      $spriteAddButton = $("#sprite-add-button");
      $spriteList = $("#sprite-list");
      $stopButton = $("#stop-button");

      pixelArtCanvas = new PixelCanvas(dimensions, "#animation-canvas",
                                       backgroundColor);
      pixelArtCanvas.paint();


      // initialize UI


      require(["typeahead"], function () {
        $spriteNameInput.typeahead({ autoselect: "first",
                                     local: [] });
        loadSprites();
      });
      
      $backgroundColorPreview.css("background-color", backgroundColor);
      $backgroundColorInput.keyup(function () {
        backgroundColor = Color.sanitize($backgroundColorInput.val());
        $backgroundColorPreview.css("background-color", backgroundColor);
        pixelArtCanvas.clear();
        pixelArtCanvas = new PixelCanvas(dimensions, "#animation-canvas",
                                         backgroundColor);
        pixelArtCanvas.paint();
      });
      $backgroundColorInput.val(backgroundColor);

      sizeCanvas();

      $framesPerSpriteInput.keyup(function () {
        frameRate = parseInt($framesPerSpriteInput.val()) || 1;
      });
      $framesPerSpriteInput.val(frameRate);

      $pixelHeight.keyup(function () {
        dimensions = { width: parseInt($pixelWidth.val(), 10) || 1,
                       height: parseInt($pixelHeight.val(), 10) || 1 };
        pixelArtCanvas.clear();
        pixelArtCanvas = new PixelCanvas(dimensions, "#animation-canvas",
                                         backgroundColor);
        pixelArtCanvas.paint();
      });
      $pixelHeight.val(dimensions.height.toString());

      $pixelWidth.keyup(function () {
        dimensions = { width: parseInt($pixelWidth.val(), 10) || 1,
                       height: parseInt($pixelHeight.val(), 10) || 1 };
        pixelArtCanvas.clear();
        pixelArtCanvas = new PixelCanvas(dimensions, "#animation-canvas",
                                         backgroundColor);
        pixelArtCanvas.paint();
      });
      $pixelWidth.val(dimensions.width.toString());

      $playButton.click(function () {
        if (scheduledFrame) return;
        displayFrame($spriteList.children().first());
      });

      $refreshButton.click(loadSprites);

      $spriteAddButton.click(function () {
        var $spriteListItem = createListElement($spriteNameInput.val());
        $spriteList.append($spriteListItem);
      });

      $stopButton.click(function () {
        if (scheduledFrame) frameClock.cancel(scheduledFrame);
        scheduledFrame = null;
      });

      $(window).resize(function() {
        sizeCanvas();
        pixelArtCanvas.paint();
      });
      
      requestAnimationFrame(timeStep);
    });
  }
);
