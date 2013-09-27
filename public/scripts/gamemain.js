require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "graphics/pixelcanvas"],
  function($, PixelCanvas){

    var $canvas;
    var gameCanvas;

    function sizeCanvas() {
      $canvas[0].width = $(window).width();
      $canvas[0].height = $(window).height();
    }

    function drawTestPattern() {
      gameCanvas.setPixel(0, 0, "#FF0000");
      gameCanvas.setPixel(1, 0, "#FFFF00");
      gameCanvas.setPixel(2, 0, "#00FF00");
      gameCanvas.setPixel(0, 1, "#00FFFF");
      gameCanvas.setPixel(1, 1, "#0000FF");
      gameCanvas.setPixel(2, 1, "#FF00FF");
      gameCanvas.paint();
    }


    $(function () {
      $canvas = $("#game-canvas");
      gameCanvas = new PixelCanvas(3, 2, "#FFFFFF", "#game-canvas");

      sizeCanvas();
      drawTestPattern();
      
      $(window).resize(function() {
        sizeCanvas();
        drawTestPattern();
      });
    });
  }
);
