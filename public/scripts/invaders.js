require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "graphics/layeredcanvas", "graphics/spritearchive",
         "actors/player", "actors/testenemy", "interface/keypoll",
         "world/collisionframe"],
  function($, LayeredCanvas, SpriteArchive, Player, TestEnemy, KeyPoll,
           CollisionFrame){

    var $canvas;
    var gameCanvas;
    var sprites;
    var playerActor;
    var lizardActor;
    var keys;

    function sizeCanvas() {
      if ($canvas[0].width !== $(window).width() ||
          $canvas[0].height !== $(window).height()){
        $canvas[0].width = $(window).width();
        $canvas[0].height = $(window).height();
      }
    }

    function mainLoop() {
      var cFrame = new CollisionFrame(256,256);
      
      playerActor.act();
      lizardActor.act();

      cFrame.set(playerActor);
      cFrame.set(lizardActor);
      cFrame.resolve();

      playerActor.paint(gameCanvas);
      lizardActor.paint(gameCanvas);
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
          playerActor = new Player(sprites, { x: 128, y: 192 }, 1, keys);
          lizardActor = new TestEnemy(sprites, { x: 128, y: 64 }, 0,
                                      { topmost: 25, bottommost: 128,
                                        leftmost: 25, rightmost: 256-25 });
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
