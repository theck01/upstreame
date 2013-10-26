require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
		typeahead: "/typeahead.js/dist/typeahead.min",
    underscore: "/underscore-amd/underscore-min"
  },
  shim: {
    bootstrap: {
      deps: ["jquery"]
    }
  }
});


require(["jquery", "underscore", "interface/pixelcolorer", "bootstrap",
         "typeahead"],
  function ($, _, PixelColorer) {
    // persistent UI variables
    var $backgroundColorInput;
    var $backgroundColorPreview;
    var $canvas;
    var pixelArtCanvas;
    var $pixelColorInput;
    var $pixelColorPreview;
    var $pixelHeight;
    var $pixelWidth;
    var $spriteNameInput;
    var $spriteSaveAlert;
    var $spriteActionButton;

    // initial canvas sizing variable
    var initialSize = 16;


    function sizeCanvas() {
      if ($canvas[0].width !== $canvas.parent().width() ||
          $canvas[0].height !== $canvas.parent().height()){
        $canvas[0].width = $canvas.parent().width();
        $canvas[0].height = $canvas.parent().height();
      }
    }


    function refreshSpriteNames() {
      $.ajax({
        url: "/sprite/all",
        type: "GET",
        dataType: "json",
        success: function (data) {
          $spriteNameInput.typeahead("destroy");
          $spriteNameInput.typeahead({ autoselect: "first",
                                       local: _.keys(data) });
        }
      });
    }


    $(function () {
      $("#hide-grid-button").click(function () {
        pixelArtCanvas.toggleGrid();
      });

      $("#clear-canvas-button").click(function () {
        pixelArtCanvas.clearCanvas();
      });

      $("input:radio[name=action]").change(function () {
        pixelArtCanvas.setAction($(this).val());
      });

      $canvas = $("#pixel-art-canvas");
      sizeCanvas();

      pixelArtCanvas = new PixelColorer(initialSize, initialSize,
                                        "#pixel-art-canvas");
      pixelArtCanvas.mousemove(function () {
        if($("input:radio[name=action]:checked").val() === "get"){
          $pixelColorInput.val(pixelArtCanvas.getColor());
          $pixelColorPreview.css("background-color", pixelArtCanvas.getColor());
        }
      });
      pixelArtCanvas.paint();

      $pixelHeight = $("#pixel-height-input");
      $pixelHeight.keyup(function () {
        pixelArtCanvas.resize(parseInt($pixelWidth.val(), 10) || 1,
                              parseInt($pixelHeight.val(), 10) || 1);
      });
      $pixelHeight.val(initialSize.toString());

      $pixelWidth = $("#pixel-width-input");
      $pixelWidth.keyup(function () {
        pixelArtCanvas.resize(parseInt($pixelWidth.val(), 10) || 1,
                              parseInt($pixelHeight.val(), 10) || 1);
      });
      $pixelWidth.val(initialSize.toString());

      $pixelColorPreview = $("#pixel-color-preview");
      $pixelColorPreview.css("background-color", pixelArtCanvas.getColor());

      $pixelColorInput = $("#pixel-color-input");
      $pixelColorInput.keyup(function () {
        pixelArtCanvas.setColor($pixelColorInput.val());
        $pixelColorPreview.css("background-color", pixelArtCanvas.getColor());
      });
      $pixelColorInput.val(pixelArtCanvas.getColor());

      $backgroundColorPreview = $("#background-color-preview");
      $backgroundColorPreview.css("background-color",
                                  pixelArtCanvas.getBackgroundColor());

      $backgroundColorInput = $("#background-color-input");
      $backgroundColorInput.keyup(function () {
        pixelArtCanvas.setBackgroundColor($backgroundColorInput.val());
        $backgroundColorPreview.css("background-color",
                                    pixelArtCanvas.getBackgroundColor());
      });
      $backgroundColorInput.val(pixelArtCanvas.getBackgroundColor());

      $spriteNameInput = $("#sprite-name-input");
      refreshSpriteNames();
      $spriteNameInput.keypress(function (e) {
        // save sprite click on enter
        if(e.keyCode === 13) $spriteActionButton.click();
      });

      $spriteSaveAlert = $("#sprite-save-alert");

      $spriteActionButton = $("#sprite-action-button");
      $spriteActionButton.click(function () {
        var name = $spriteNameInput.val();
        var sprite = pixelArtCanvas.exportImage();

        if(_.isEmpty(sprite.pixels) &&
           $spriteActionButton.text() === "Save Sprite"){
          $spriteSaveAlert.text("Please draw a sprite before saving");
          $spriteSaveAlert.addClass("alert-danger");
          $spriteSaveAlert.removeClass("alert-success");
          $spriteSaveAlert.attr("hidden", false);
        }
        else if(name === ""){
          $spriteSaveAlert.text("Please specify a sprite name");
          $spriteSaveAlert.addClass("alert-danger");
          $spriteSaveAlert.removeClass("alert-success");
          $spriteSaveAlert.attr("hidden", false);
        }
        else if(name.match(/[^A-Za-z0-9-_]+/) !== null){
          var msg = "Valid sprite names can contain '-', '_', and ";
          msg += "alphanumeric characters";
          $spriteSaveAlert.text(msg);
          $spriteSaveAlert.addClass("alert-danger");
          $spriteSaveAlert.removeClass("alert-success");
          $spriteSaveAlert.attr("hidden", false);
        }
        else{
          if($spriteActionButton.text() === "Save Sprite"){
            $.ajax({
              url: "/sprite/" + name,
              type: "POST",
              contentType: "application/json",
              data: JSON.stringify(sprite),
              error: function (jqXHR) {
                if(jqXHR.status  === 400){
                  $spriteSaveAlert.text("Client error.");
                  $spriteSaveAlert.addClass("alert-danger");
                  $spriteSaveAlert.removeClass("alert-success");
                  $spriteSaveAlert.attr("hidden", false);
                }
                else{
                  $spriteSaveAlert.text("Server error.");
                  $spriteSaveAlert.addClass("alert-danger");
                  $spriteSaveAlert.removeClass("alert-success");
                  $spriteSaveAlert.attr("hidden", false);
                }
              },
              success: function () {
                $spriteNameInput.typeahead("setQuery", "");

                if($spriteSaveAlert.hasClass("alert-success")){
                  $spriteSaveAlert.removeClass("animated bounce");
                  $spriteSaveAlert.addClass("animated bounce");
                }
                else{
                  $spriteSaveAlert.addClass("alert-success");
                  $spriteSaveAlert.removeClass("alert-danger");
                }
                $spriteSaveAlert.text("Saved!");
                $spriteSaveAlert.attr("hidden", false);

                refreshSpriteNames();
              }
            });
          }
          else{
            $.ajax({
              url: "/sprite/" + name,
              type: "GET",
              dataType: "json",
              error: function (jqXHR) {
                if(jqXHR.status  === 404){
                  $spriteSaveAlert.text(name + " not found");
                  $spriteSaveAlert.addClass("alert-danger");
                  $spriteSaveAlert.removeClass("alert-success");
                  $spriteSaveAlert.attr("hidden", false);
                }
                else{
                  $spriteSaveAlert.text("Server error.");
                  $spriteSaveAlert.addClass("alert-danger");
                  $spriteSaveAlert.removeClass("alert-success");
                  $spriteSaveAlert.attr("hidden", false);
                }
              },
              success: function (data) {
                pixelArtCanvas.importImage(data.pixels);
                $spriteSaveAlert.attr("hidden", true);
                $spriteNameInput.typeahead("setQuery", "");
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
        pixelArtCanvas.paint();
      });
    });
  }
);
