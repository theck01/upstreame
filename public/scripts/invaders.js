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

    var DIMENSIONS = { x: 400, y: 300 };

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
      Game.canvas = new LayeredCanvas(DIMENSIONS.x, DIMENSIONS.y,
                                      "#game-canvas", "#000000");
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

          Game.world.add(new Player("Allies", sprites, {
            x: Math.floor(DIMENSIONS.x * 0.5),
            y: Math.floor(DIMENSIONS.y * 0.75)
          }, 2, Game.keys));

          Game.world.add(new TestEnemy("Enemies", sprites, {
            x: Math.floor(DIMENSIONS.x * 0.5),
            y: Math.floor(DIMENSIONS.y * 0.25)
          }, 3, {
            leftmost: 25, rightmost: DIMENSIONS.x - 25,
            topmost: 25, bottommost: DIMENSIONS.y - 25
          }, Game.clock));

          Game.world.add(new EnergyEnemy("Enemies", sprites, {
            x: Math.floor(DIMENSIONS.x * 0.5),
            y: Math.floor(DIMENSIONS.y * 0.25)
          }, 1, Game.clock));

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
