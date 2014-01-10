require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "/jquery/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "core/graphics/pixelcanvas", "core/graphics/sprite"],
  function ($, PixelCanvas, Sprite) {

    var $canvas;
    var gameCanvas;
    var splashScreenSprite;

    function sizeCanvas () {
      if ($canvas[0].width !== $(window).width() ||
          $canvas[0].height !== $(window).height()){
        $canvas[0].width = $(window).width();
        $canvas[0].height = $(window).height();
      }
    }
    
    $(function () {
      $canvas = $("#game-canvas");
      gameCanvas = new PixelCanvas({ width: 128, height: 128 }, "#game-canvas",
                                   "#000000");

      $.ajax({
        type: "GET",
        url: "/sprite/splash-screen",
        dataType: "json",
        success: function (data) {
          splashScreenSprite = new Sprite(data.pixels);
          splashScreenSprite.paintOn(gameCanvas, { x: 64, y: 64 });
          gameCanvas.paint();
        }
      });

      sizeCanvas();
 
      $(window).resize(function() {
        sizeCanvas();
        splashScreenSprite.paintOn(gameCanvas, { x: 64, y: 64 });
        gameCanvas.paint();
      });
    });
  }
);
