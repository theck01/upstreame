require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "/jquery/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "core/graphics/spritearchive", "core/graphics/viewport",
         "core/interface/keypoll", "core/util/frameclock", "core/util/eventhub",
         "submersion/actors/submersible", "submersion/actors/fishschool"],
  function($, SpriteArchive, Viewport, KeyPoll, FrameClock, EventHub, 
           Submersible, FishSchool) {

    var DIMENSIONS = { width: 400, height: 237 };
    var $canvas;
    var Game = Object.create(null);
    var sub;
    var tigerSchoolRight;
    var surgeonSchoolLeft;


    function sizeCanvas () {
      if ($canvas[0].width !== $(window).width() ||
          $canvas[0].height !== $(window).height()){
        $canvas[0].width = $(window).width();
        $canvas[0].height = $(window).height();
      }
    }


    function mainLoop () {
      Game.clock.tick();
      EventHub.trigger("world.step");
      Game.viewport.render();
      requestAnimationFrame(mainLoop);
    }


    $(function () {
      $canvas = $("#game-canvas");
      Game.keys = new KeyPoll();
      Game.viewport = new Viewport({
        dimensions: DIMENSIONS,
        origin: { x: 0, y: 0 },
        canvasID: "#game-canvas",
        backgroundColor: "#224477"
      });
      Game.clock = new FrameClock();

      $.ajax({
        async: false,
        type: "GET",
        url: "/sprite/all",
        dataType: "json",
        success: function (data) {
          SpriteArchive.load(data);

          sub = new Submersible({
            group: "Player",
            center: {
              x: Math.floor(DIMENSIONS.width * 0.25),
              y: Math.floor(DIMENSIONS.height * 0.5)
            },
            layer: 2,
            noncollidables: ["Player"],
            frameClock: Game.clock,
            keypoll: Game.keys
          });

          tigerSchoolRight = new FishSchool({
            group: "Tiger",
            sprite: SpriteArchive.get("tiger-fish-right"),
            center: {
              x: Math.floor(DIMENSIONS.width * 0.75),
              y: Math.floor(DIMENSIONS.height * 0.66)
            },
            layer: 3,
            noncollidables: ["Tiger"],
            count: 30,
            density: 1,
            frameClock: Game.clock,
            velocity: { x: 0, y: 0 }
          });

          surgeonSchoolLeft = new FishSchool({
            group: "Surgeon",
            sprite: SpriteArchive.get("surgeon-fish-left"),
            center: {
              x: Math.floor(DIMENSIONS.width * 0.75),
              y: Math.floor(DIMENSIONS.height * 0.33)
            },
            layer: 3,
            noncollidables: ["Surgeon"],
            count: 20,
            density: 1.5,
            frameClock: Game.clock,
            velocity: { x: 0, y: 0 }
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
