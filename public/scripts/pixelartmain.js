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

require(["jquery", "interface/pixelcolorer", "graphics/color", "bootstrap"],
  function ($, PixelColorer, Color) {
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
          $pixelColorInput.val(Color.hex(pixelArtCanvas.getColor()));
      });
      pixelArtCanvas.paint();

      $pixelColorInput = $("#pixel-color-input");
      $pixelColorInput.keyup(function () {
        pixelArtCanvas.setColor(Color.tuple($pixelColorInput.val()));
      });

      
      $(window).resize(function() {
        sizeCanvas();
        pixelArtCanvas.paint();
      });
    });

  }
);
