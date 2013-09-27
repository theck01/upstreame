require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  },
  shim: {
    "bootstrap": {
      deps: ["jquery"]
    }
  }
});

require(["jquery", "interface/pixelcolorer", "bootstrap"],
  function ($, PixelColorer) {
    var $backgroundColorInput;
    var $canvas;
    var pixelArtCanvas;
    var $pixelColorInput;

    function sizeCanvas() {
      $canvas[0].width = $canvas.parent().width();
      $canvas[0].height = $canvas.parent().height();
    }

    $(function () {
      $("input:radio[name=action]").change(function () {
        pixelArtCanvas.setAction($(this).val());
      });

      $canvas = $("#pixel-art-canvas");
      sizeCanvas();

      pixelArtCanvas = new PixelColorer(16, 16, "#pixel-art-canvas");
      pixelArtCanvas.click(function () {
        if($("input:radio[name=action]:checked").val() === "get")
          $pixelColorInput.val(pixelArtCanvas.getColor());
      });
      pixelArtCanvas.paint();

      $pixelColorInput = $("#pixel-color-input");
      $pixelColorInput.keyup(function () {
        pixelArtCanvas.setColor($pixelColorInput.val());
      });
      $pixelColorInput.val(pixelArtCanvas.getColor());

      $backgroundColorInput = $("#background-color-input");
      $backgroundColorInput.keyup(function () {
        pixelArtCanvas.setBackgroundColor($backgroundColorInput.val());
      });
      $backgroundColorInput.val(pixelArtCanvas.getBackgroundColor());

      
      $(window).resize(function() {
        sizeCanvas();
        pixelArtCanvas.paint();
      });
    });

  }
);
