require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "graphics/layeredcanvas", "graphics/spritearchive"],
  function($, LayeredCanvas, SpriteArchive){

    var $canvas;
    var gameCanvas;
    var sprites;

    function sizeCanvas() {
      $canvas[0].width = $(window).width();
      $canvas[0].height = $(window).height();
    }

    function drawTestPattern() {
      sprites.get("human-ship").paint(gameCanvas, { x: 128, y: 192 }, 0);
      sprites.get("lizard-ship").paint(gameCanvas, { x: 128, y: 64 }, 0);
      gameCanvas.paint();
    }

    $(function () {
      $canvas = $("#game-canvas");
      gameCanvas = new LayeredCanvas(256, 256, "#000000", "#game-canvas");

      $.ajax({
        async: false,
        type: "GET",
        url: "/sprite/all",
        dataType: "json",
        success: function (data) {
          sprites = new SpriteArchive(data);
        }
      });

      sizeCanvas();
      drawTestPattern();
 
      $(window).resize(function() {
        sizeCanvas();
        drawTestPattern();
      });
    });
  }
);
