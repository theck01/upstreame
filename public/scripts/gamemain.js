require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "graphics/layeredcanvas", "graphics/sprite"],
  function($, LayeredCanvas, Sprite){

    var $canvas;
    var gameCanvas;
    var humanShipSprite;
    var lizardShipSprite;

    function sizeCanvas() {
      $canvas[0].width = $(window).width();
      $canvas[0].height = $(window).height();
    }

    function drawTestPattern() {
      humanShipSprite.paint(gameCanvas, { x: 128, y: 192 }, 0);
      lizardShipSprite.paint(gameCanvas, { x: 128, y: 64 }, 0);
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
          humanShipSprite = new Sprite(data["human-ship"].pixels,
                                       data["human-ship"].center);
          lizardShipSprite = new Sprite(data["lizard-ship"].pixels,
                                        data["lizard-ship"].center);
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
