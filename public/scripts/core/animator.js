require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "/jquery/jquery.min",
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
    var $animationNameInput;
    var $animationActionButton;
    var $animationActionSelect;
    var $animationSaveLink;
    var $animationLoadLink;
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
    var statusAlert;
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
      else {
        statusAlert.display(spriteName + " does not exist", true);
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
        },
        error: function (jqXHR) {
          statusAlert.display("Could not load sprites: " + jqXHR.status +
                              "error", true);
        }
      });
    }


    function updateCanvas() {
      pixelArtCanvas.clear();
      pixelArtCanvas = new PixelCanvas(dimensions, "#animation-canvas",
                                       backgroundColor);
      pixelArtCanvas.paint();
    }


    $(function () {

      // initialize all variables
      $animationNameInput = $("#animation-name-input");
      $animationActionButton = $("#animation-action-button");
      $animationActionSelect = $("#animation-action-select");
      $animationSaveLink = $("#animation-save-link");
      $animationLoadLink = $("#animation-load-link");
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
      statusAlert = new StatusAlert("#status-alert");
      $stopButton = $("#stop-button");

      pixelArtCanvas = new PixelCanvas(dimensions, "#animation-canvas",
                                       backgroundColor);
      pixelArtCanvas.paint();

      loadSprites();


      // initialize UI
      $backgroundColorPreview.css("background-color", backgroundColor);
      $backgroundColorInput.keyup(function () {
        backgroundColor = Color.sanitize($backgroundColorInput.val());
        $backgroundColorPreview.css("background-color", backgroundColor);
        updateCanvas();
      });
      $backgroundColorInput.val(backgroundColor);

      sizeCanvas();

      $framesPerSpriteInput.keyup(function () {
        frameRate = parseInt($framesPerSpriteInput.val()) || 1;
      });
      $framesPerSpriteInput.val(frameRate.toString());

      $pixelHeight.keyup(function () {
        dimensions = { width: parseInt($pixelWidth.val(), 10) || 1,
                       height: parseInt($pixelHeight.val(), 10) || 1 };
        updateCanvas();
      });
      $pixelHeight.val(dimensions.height.toString());

      $pixelWidth.keyup(function () {
        dimensions = { width: parseInt($pixelWidth.val(), 10) || 1,
                       height: parseInt($pixelHeight.val(), 10) || 1 };
        updateCanvas();
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

      $animationActionButton.click(function () {
        var name = $animationNameInput.val();

        if($spriteList.children().length === 0 &&
          $animationActionButton.text() === "Save Animation"){
          statusAlert.display("Please add sprites to animation before saving",
                              true);
        }
        else if(name === "") {
          statusAlert.display("Please specify a sprite name", true);
        }
        else if(name.match(/[^A-Za-z0-9-_]+/) !== null){
          var msg = "Valid sprite names can contain '-', '_', and ";
          msg += "alphanumeric characters";
          statusAlert.display(msg, true);
        }
        else{
          if($animationActionButton.text() === "Save Animation"){
            var spriteNames = _.map($spriteList.children(), function (li) {
              return $(li).children(".form-control").val();
            });

            var animation = {
              backgroundColor: backgroundColor,
              dimensions: dimensions,
              framesPerSprite: frameRate,
              spriteList: spriteNames
            };

            $.ajax({
              url: "/animation/" + name,
              type: "POST",
              contentType: "application/json",
              data: JSON.stringify(animation),
              error: function (jqXHR) {
                if(jqXHR.status  === 400) {
                  statusAlert.display("Client error.", true);
                }
                else if(jqXHR.status === 401) {
                  statusAlert.display("Please login before saving sprites.",
                                      true);
                }
                else statusAlert.display("Server error.", true);
              },
              success: function () {
                $animationNameInput.val("");
                statusAlert.display("Saved!", false);
              }
            });
          }
          else{
            $.ajax({
              url: "/animation/" + name,
              type: "GET",
              dataType: "json",
              error: function (jqXHR) {
                if(jqXHR.status  === 404){
                  statusAlert.display(name + " not found.", true);
                }
                else{
                  statusAlert.display("Server error.", true);
                }
              },
              success: function (data) {
                backgroundColor = data.backgroundColor;
                $backgroundColorInput.val(backgroundColor);
                $backgroundColorPreview.css("background-color",
                                            backgroundColor);
                
                dimensions = data.dimensions;
                $pixelWidth.val(dimensions.width.toString());
                $pixelHeight.val(dimensions.height.toString());

                frameRate = data.framesPerSprite;
                $framesPerSpriteInput.val(frameRate.toString());
                
                $spriteList.empty();
                _.each(data.spriteList, function (name) {
                  $spriteList.append(createListElement(name));
                });

                updateCanvas();
              }
            });
          }
        }
      });

      $animationSaveLink.click(function() {
        $animationActionButton.text("Save Animation");
      });

      $animationLoadLink.click(function() {
        $animationActionButton.text("Load Animation");
      });

      $(window).resize(function() {
        sizeCanvas();
        pixelArtCanvas.paint();
      });
      
      requestAnimationFrame(timeStep);
    });
  }
);
