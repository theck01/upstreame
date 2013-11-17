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
         "interface/keypoll", "util/frameclock", "scene/starfield",
         "world/world"],
  function($, LayeredCanvas, SpriteArchive, Player, TestEnemy, EnergyEnemy,
           KeyPoll, FrameClock, Starfield, World){

    var DIMENSIONS = { x: 400, y: 300 };

    var $canvas;
    var gameCanvas;
    var gameClock;
    var gameWorld;
    var keys;
    var sprites;
    var starfield;

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
      gameCanvas = new LayeredCanvas(DIMENSIONS.x, DIMENSIONS.y, "#game-canvas",
                                     "#000000");
      gameClock = new FrameClock();
      starfield = new Starfield(DIMENSIONS, { x: 0.5, y: 1 }, 0, gameClock);
      gameWorld = new World(DIMENSIONS, starfield);

      $.ajax({
        async: false,
        type: "GET",
        url: "/sprite/all",
        dataType: "json",
        success: function (data) {
          sprites = new SpriteArchive(data);

          gameWorld.add(new Player("Allies", sprites, {
            x: Math.floor(DIMENSIONS.x * 0.5),
            y: Math.floor(DIMENSIONS.y * 0.75)
          }, 2, keys));

          gameWorld.add(new TestEnemy("Enemies", sprites, {
            x: Math.floor(DIMENSIONS.x * 0.5),
            y: Math.floor(DIMENSIONS.y * 0.25)
          }, 3, {
            leftmost: 25, rightmost: DIMENSIONS.x - 25,
            topmost: 25, bottommost: DIMENSIONS.y - 25
          }, gameClock));

          gameWorld.add(new EnergyEnemy("Enemies", sprites, {
            x: Math.floor(DIMENSIONS.x * 0.5),
            y: Math.floor(DIMENSIONS.y * 0.25)
          }, 1, gameClock));

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
