require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "interface/pixelcolorer"],
  function ($, PixelColorer) {
    var $canvas;
    var pixelArtCanvas;

    function sizeCanvas() {
      $canvas[0].width = $canvas.parent().width();
      $canvas[0].height = $canvas.parent().height();
    }

    $(function () {
      $canvas = $("#pixel-art-canvas");
      sizeCanvas();

      pixelArtCanvas = new PixelColorer(16, 16, "#pixel-art-canvas");
      pixelArtCanvas.paint();
      
      $(window).resize(function() {
        sizeCanvas();
        pixelArtCanvas.paint();
      });
    });

  }
);
