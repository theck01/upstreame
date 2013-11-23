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
         "interface/keypoll", "util/frameclock", "util/game", "scene/starfield",
         "world/world"],
  function($, LayeredCanvas, SpriteArchive, Player, TestEnemy, EnergyEnemy,
           KeyPoll, FrameClock, Game, Starfield, World){

    var DIMENSIONS = { width: 400, height: 300 };

    var $canvas;

    function sizeCanvas() {
      if ($canvas[0].width !== $(window).width() ||
          $canvas[0].height !== $(window).height()){
        $canvas[0].width = $(window).width();
        $canvas[0].height = $(window).height();
      }
    }

    function mainLoop() {
      Game.clock.tick();
      Game.world.timestep();
      Game.world.paint(Game.canvas);
      Game.canvas.paint();
      requestAnimationFrame(mainLoop);
    }

    $(function () {
      $canvas = $("#game-canvas");
      Game.keys = new KeyPoll();
      Game.canvas = new LayeredCanvas(DIMENSIONS, "#game-canvas", "#000000");
      Game.clock = new FrameClock();

      var starfield = new Starfield(DIMENSIONS, { x: 0.5, y: 1 }, 0,
                                    Game.clock);
      Game.world = new World(DIMENSIONS, starfield);

      $.ajax({
        async: false,
        type: "GET",
        url: "/sprite/all",
        dataType: "json",
        success: function (data) {
          var sprites = new SpriteArchive(data);

          new Player({
            group: "Allies",
            archive: sprites,
            center: {
              x: Math.floor(DIMENSIONS.width * 0.5),
              y: Math.floor(DIMENSIONS.height * 0.75)
            },
            layer: 2,
            noncollidables: ["Allies"],
            frameClock: Game.clock,
            keypoll: Game.keys
          });

          new TestEnemy({
            group: "Enemies",
            sprite: sprites.get("lizard-ship"),
            center: {
              x: Math.floor(DIMENSIONS.width * 0.5),
              y: Math.floor(DIMENSIONS.height * 0.25)
            },
            layer: 3,
            noncollidables: ["Enemies"],
            bounds: {
              leftmost: 25, rightmost: DIMENSIONS.width - 25,
              topmost: 25, bottommost: DIMENSIONS.height - 25
            },
            frameClock: Game.clock
          });

          new EnergyEnemy({
            group: "Enemies",
            archive: sprites,
            center: {
              x: Math.floor(DIMENSIONS.width * 0.5),
              y: Math.floor(DIMENSIONS.height * 0.25)
            },
            layer: 1,
            noncollidables: ["Enemies"],
            frameClock: Game.clock
          });

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