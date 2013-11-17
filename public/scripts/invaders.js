require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "/jquery/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "graphics/layeredcanvas", "graphics/spritearchive",
         "actors/player", "actors/testenemy", "actors/energyenemy",
         "interface/keypoll", "util/frameclock", "world/world"],
  function($, LayeredCanvas, SpriteArchive, Player, TestEnemy, EnergyEnemy,
           KeyPoll, FrameClock, World){

    var $canvas;
    var gameCanvas;
    var gameClock;
    var gameWorld;
    var keys;
    var sprites;

    function sizeCanvas() {
      if ($canvas[0].width !== $(window).width() ||
          $canvas[0].height !== $(window).height()){
        $canvas[0].width = $(window).width();
        $canvas[0].height = $(window).height();
      }
    }

    function mainLoop() {
      gameClock.tick();
      gameWorld.timestep();
      gameWorld.paint(gameCanvas);
      gameCanvas.paint();
      requestAnimationFrame(mainLoop);
    }

    $(function () {
      $canvas = $("#game-canvas");
      keys = new KeyPoll();
      gameCanvas = new LayeredCanvas(256, 256, "#game-canvas", "#000000");
      gameClock = new FrameClock();
      gameWorld = new World({ x: 256, y: 256 });

      $.ajax({
        async: false,
        type: "GET",
        url: "/sprite/all",
        dataType: "json",
        success: function (data) {
          sprites = new SpriteArchive(data);
          gameWorld.add(new Player(sprites, { x: 128, y: 192 }, 1, keys));
          gameWorld.add(new TestEnemy(gameClock, sprites, { x: 128, y: 45 }, 2,
                                      { leftmost: 25, rightmost: 230,
                                        topmost: 25, bottommost: 100 }));
          gameWorld.add(new EnergyEnemy(gameClock, sprites, { x: 128, y: 64 },
                                        0));
          requestAnimationFrame(mainLoop);
        }
      });

      sizeCanvas();
 
      $(window).resize(function() {
        sizeCanvas();
      });
    });
  }
);
