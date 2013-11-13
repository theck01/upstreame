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
         "interface/keypoll", "util/frameclock", "world/collisionframe"],
  function($, LayeredCanvas, SpriteArchive, Player, TestEnemy, EnergyEnemy,
           KeyPoll, FrameClock, CollisionFrame){

    var $canvas;
    var gameCanvas;
    var gameClock;
    var sprites;
    var playerActor;
    var testActor;
    var energyActor;
    var keys;

    function sizeCanvas() {
      if ($canvas[0].width !== $(window).width() ||
          $canvas[0].height !== $(window).height()){
        $canvas[0].width = $(window).width();
        $canvas[0].height = $(window).height();
      }
    }

    function mainLoop() {
      gameClock.tick();
      requestAnimationFrame(mainLoop);
    }

    $(function () {
      $canvas = $("#game-canvas");
      keys = new KeyPoll();
      gameCanvas = new LayeredCanvas(256, 256, "#game-canvas", "#000000");
      gameClock = new FrameClock();

      gameClock.recurring(function () {
        var cFrame = new CollisionFrame(256,256);
        
        playerActor.act();
        testActor.act();
        energyActor.act();

        cFrame.set(playerActor);
        cFrame.set(testActor);
        cFrame.set(energyActor);
        cFrame.resolve();

        playerActor.paint(gameCanvas);
        testActor.paint(gameCanvas);
        energyActor.paint(gameCanvas);
        gameCanvas.paint();
      }, 1);

      $.ajax({
        async: false,
        type: "GET",
        url: "/sprite/all",
        dataType: "json",
        success: function (data) {
          sprites = new SpriteArchive(data);
          playerActor = new Player(sprites, { x: 128, y: 192 }, 1, keys);
          testActor = new TestEnemy(gameClock, sprites, { x: 128, y: 45 }, 2,
                                    { leftmost: 25, rightmost: 230,
                                      topmost: 25, bottommost: 100 });
          energyActor = new EnergyEnemy(gameClock, sprites, { x: 128, y: 64 },
                                        0);
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
