require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "graphics/layeredcanvas", "graphics/spritearchive",
         "actors/base", "interface/keypoll"],
  function($, LayeredCanvas, SpriteArchive, BaseActor, KeyPoll){

    var $canvas;
    var gameCanvas;
    var sprites;
    var shipActor;
    var keys;

    function sizeCanvas() {
      if ($canvas[0].width !== $(window).width() ||
          $canvas[0].height !== $(window).height()){
        $canvas[0].width = $(window).width();
        $canvas[0].height = $(window).height();
      }
    }

    function mainLoop() {

      var directions = [];
      if (keys.poll(87)) directions.push("UP");
      if (keys.poll(65)) directions.push("LEFT");
      if (keys.poll(68)) directions.push("RIGHT");
      if (keys.poll(83)) directions.push("DOWN");
      shipActor.shift(directions);

      shipActor.paint(gameCanvas);
      sprites.get("lizard-ship").paint(gameCanvas, { x: 128, y: 64 }, 0);
      gameCanvas.paint();

      requestAnimationFrame(mainLoop);
    }

    $(function () {
      $canvas = $("#game-canvas");
      keys = new KeyPoll();
      gameCanvas = new LayeredCanvas(256, 256, "#game-canvas", "#000000");

      $.ajax({
        async: false,
        type: "GET",
        url: "/sprite/all",
        dataType: "json",
        success: function (data) {
          sprites = new SpriteArchive(data);
          shipActor = new BaseActor(sprites.get("human-ship"),
                                    { x: 128, y: 192 }, 0, []);
        }
      });

      sizeCanvas();
 
      $(window).resize(function() {
        sizeCanvas();
      });

      requestAnimationFrame(mainLoop);
    });
  }
);
