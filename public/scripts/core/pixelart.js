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


require(["jquery", "underscore", "core/controller/modelbuilder",
         "core/graphics/color", "core/graphics/pixelcanvas",
         "core/interface/clickcanvasinterface", "core/interface/statusalert",
         "core/model/converters/spriteconverter", "core/util/eventhub",
         "bootstrap", "core/interface/toollayoutloginform"],
  function ($, _, ModelBuilder, Color, PixelCanvas, CanvasClickInterface,
            StatusAlert, SpriteConverter, EventHub) {
    // persistent UI variables
    var $backgroundColorInput;
    var $backgroundColorPreview;
    var $canvas;
    var $pixelColorInput;
    var $pixelColorPreview;
    var $pixelHeight;
    var $pixelWidth;
    var $redoButton;
    var $spriteNameInput;
    var statusAlert;
    var $spriteActionButton;
    var $undoButton;

    var modelBuilder;
    var pixelCanvas;
    var clickInterface;
    var gridEnabled = true;


    // initial canvas sizing variable
    var initialSize = 16;


    function sizeCanvas() {
      if ($canvas[0].width !== $canvas.parent().width() ||
          $canvas[0].height !== $canvas.parent().height()){
        $canvas[0].width = $canvas.parent().width();
        $canvas[0].height = $canvas.parent().height();
      }
    }


    function updateColorUI(dontModifyTextFields) {
      $backgroundColorPreview.css("background-color",
                                  modelBuilder.getDefaultElement().color);
      $pixelColorPreview.css("background-color",
                             modelBuilder.getCurrentElement().color);

      if (!dontModifyTextFields) {
        $pixelColorInput.val(modelBuilder.getCurrentElement().color);
        $backgroundColorInput.val(modelBuilder.getDefaultElement().color);
      }
    }


    $(function () {
      statusAlert = new StatusAlert("#status-alert");

      $("#hide-grid-button").click(function () {
        gridEnabled = !gridEnabled;
        modelBuilder.paint();
      });

      $("#clear-canvas-button").click(function () {
        modelBuilder.clear();
      });

      $("input:radio[name=action]").change(function () {
        modelBuilder.setAction($(this).val());
      });

      $undoButton = $("#undo-action-button");
      $undoButton.click(function () {
        modelBuilder.undo();
      });

      $redoButton = $("#redo-action-button");
      $redoButton.click(function () {
        modelBuilder.redo();
      });

      $canvas = $("#pixel-art-canvas");
      sizeCanvas();

      // setup keyboard shortcuts
      $("body").keypress(function (e) {

        // do nothing for input keypress events
        if ($(e.target).is("input")) return;

        // 'C' for coordinate system toggle
        if (e.which === 99) {
          $("#hide-grid-button").click();
        }
        // 'D' for draw
        else if (e.which === 100) {
          $("#set-radio-button").click();
        }
        // 'E' for erase
        else if (e.which === 101) {
          $("#clear-radio-button").click();
        }
        // 'F' for fill
        else if (e.which === 102) {
          $("#fill-radio-button").click();
        }
        // 'G' for get
        else if (e.which === 103) {
          $("#get-radio-button").click();
        }
        // 'R' for redo
        else if (e.which === 114) {
          $redoButton.click();
        }
        // 'U' for undo
        else if (e.which === 117) {
          $undoButton.click();
        }
      });

      pixelCanvas = new PixelCanvas({
        width: initialSize,
        height: initialSize
      }, "#pixel-art-canvas", "#FFFFFF");

      clickInterface = new CanvasClickInterface(pixelCanvas);

      modelBuilder = new ModelBuilder(pixelCanvas, { color: "#FFFFFF" },
                                      { color: "#000000" }, SpriteConverter);
      modelBuilder.mousemove(function () {
        if($("input:radio[name=action]:checked").val() === "get"){
          updateColorUI();
        }
      });

      EventHub.subscribe("modelbuilder.redraw", function () {
        if (gridEnabled) clickInterface.paintGrid();
      });
      EventHub.subscribe("canvas.action", function () {
        updateColorUI();
      });
      EventHub.subscribe("canvas.release", function () {
        updateColorUI();
      });

      modelBuilder.paint();

      $pixelHeight = $("#pixel-height-input");
      $pixelHeight.keyup(function () {
        modelBuilder.resize(parseInt($pixelWidth.val(), 10) || 1,
                            parseInt($pixelHeight.val(), 10) || 1);
      });
      $pixelHeight.val(initialSize.toString());

      $pixelWidth = $("#pixel-width-input");
      $pixelWidth.keyup(function () {
        modelBuilder.resize(parseInt($pixelWidth.val(), 10) || 1,
                            parseInt($pixelHeight.val(), 10) || 1);
      });
      $pixelWidth.val(initialSize.toString());

      $pixelColorPreview = $("#pixel-color-preview");
      $pixelColorInput = $("#pixel-color-input");
      $pixelColorInput.keyup(function () {
        modelBuilder.setCurrentElement({
          color: Color.sanitize($pixelColorInput.val())
        });
        updateColorUI(true);
      });

      $backgroundColorPreview = $("#background-color-preview");
      $backgroundColorInput = $("#background-color-input");
      $backgroundColorInput.keyup(function () {
        modelBuilder.setDefaultElement({
          color: Color.sanitize($backgroundColorInput.val())
        });
        updateColorUI(true);
      });
      
      updateColorUI();


      $spriteNameInput = $("#sprite-name-input");

      $spriteActionButton = $("#sprite-action-button");
      $spriteActionButton.click(function () {
        var name = $spriteNameInput.val();
        var imageJSON = modelBuilder.exportModel();
        var image = JSON.parse(imageJSON);

        if(_.isEmpty(image.pixels) &&
          $spriteActionButton.text() === "Save Sprite"){
          statusAlert.display("Please draw a sprite before saving", true);
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
          if($spriteActionButton.text() === "Save Sprite"){
            $.ajax({
              url: "/sprite/" + name,
              type: "POST",
              contentType: "application/json",
              data: imageJSON,
              error: function (jqXHR) {
                if(jqXHR.status  === 400) {
                  statusAlert.display("Client error, see console output.",
                                      true);
                  console.log(jqXHR.responseText);
                }
                else if(jqXHR.status === 401) {
                  statusAlert.display("Please login before saving sprites.",
                                      true);
                }
                else statusAlert.display("Server error.", true);
              },
              success: function () {
                $spriteNameInput.val("");
                statusAlert.display("Saved!", false);
              }
            });
          }
          else{
            $.ajax({
              url: "/sprite/" + name,
              type: "GET",
              dataType: "text",
              error: function (jqXHR) {
                if(jqXHR.status  === 404){
                  statusAlert.display(name + " not found.", true);
                }
                else{
                  statusAlert.display("Server error.", true);
                }
              },
              success: function (data) {
                modelBuilder.importModel(data);

                var image = JSON.parse(data);

                if (image.dimensions) {
                  $pixelHeight.val(image.dimensions.height.toString());
                  $pixelWidth.val(image.dimensions.width.toString());
                }
                updateColorUI();
                statusAlert.hide();
                $spriteNameInput.val("");
              }
            });
          }
        }
      });

      $("#sprite-save-link").click(function() {
        $spriteActionButton.text("Save Sprite");
      });

      $("#sprite-load-link").click(function() {
        $spriteActionButton.text("Load Sprite");
      });

      $(window).resize(function() {
        sizeCanvas();
        modelBuilder.paint();
      });
    });
  }
);
