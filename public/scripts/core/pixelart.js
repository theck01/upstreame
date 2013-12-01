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


require(["jquery", "underscore", "core/interface/pixelcolorer", "bootstrap",
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
    var $statusAlert;
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

    function displayAlert (message, error) {
      if (error) {
        $statusAlert.addClass("alert-danger");
        $statusAlert.removeClass("alert-success");
      }
      else {
        $statusAlert.removeClass("alert-danger");
        $statusAlert.addClass("alert-success");
      }

      $statusAlert.text(message);
      $statusAlert.attr("hidden", false);
    }


    $(function () {
      $statusAlert = $("#status-alert");

      $("#login-button").click(function () {
        $.ajax({
          url: "/login",
          type: "POST",
          data: {
            "username": $("#username-field").val(),
            "password": $("#password-field").val()
          },
          success: function () {
            displayAlert("Welcome back!", false);
            $("#login-form").attr("hidden", true);
            $("#logout-form").attr("hidden", false);
          },
          error: function (jqXHR) {
            if(jqXHR.status  === 401) {
              displayAlert("Username or password incorrect. Please try again.",
                           true);
            }
            else displayAlert("Server error.", true);
          }
        });

        $("#username-field").val("");
        $("#password-field").val("");
      });

      $("#logout-button").click(function () {
        $.ajax({
          url: "/logout",
          type: "POST",
          success: function () {
            $statusAlert.attr("hidden", true);
            $("#login-form").attr("hidden", false);
            $("#logout-form").attr("hidden", true);
          },
          error: function (jqXHR) {
            if(jqXHR.status === 500) {
              displayAlert("Server error.", true);
            }
            else displayAlert("Client error.", true);
          }
        });
      });

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

      pixelArtCanvas = new PixelColorer({
        width: initialSize,
        height: initialSize
      }, "#pixel-art-canvas");

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

      $spriteActionButton = $("#sprite-action-button");
      $spriteActionButton.click(function () {
        var name = $spriteNameInput.val();
        var sprite = pixelArtCanvas.exportImage();

        if(_.isEmpty(sprite.pixels) &&
           $spriteActionButton.text() === "Save Sprite"){
          displayAlert("Please draw a sprite before saving", true);
        }
        else if(name === "") displayAlert("Please specify a sprite name", true);
        else if(name.match(/[^A-Za-z0-9-_]+/) !== null){
          var msg = "Valid sprite names can contain '-', '_', and ";
          msg += "alphanumeric characters";
          displayAlert(msg, true);
        }
        else{
          if($spriteActionButton.text() === "Save Sprite"){
            $.ajax({
              url: "/sprite/" + name,
              type: "POST",
              contentType: "application/json",
              data: JSON.stringify(sprite),
              error: function (jqXHR) {
                if(jqXHR.status  === 400) displayAlert("Client error.", true);
                else if(jqXHR.status === 401) {
                  displayAlert("Please login before saving sprites.", true);
                }
                else displayAlert("Server error.", true);
              },
              success: function () {
                $spriteNameInput.typeahead("setQuery", "");

                if($statusAlert.hasClass("alert-success")){
                  $statusAlert.removeClass("animated bounce");
                  $statusAlert.addClass("animated bounce");
                }
                displayAlert("Saved!", false);

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
                  displayAlert(name + " not found.", true);
                }
                else{
                  displayAlert("Server error.", true);
                }
              },
              success: function (data) {
                pixelArtCanvas.importImage(data.pixels);
                $statusAlert.attr("hidden", true);
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
