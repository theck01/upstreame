require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "/jquery/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "core/graphics/spritearchive",
         "core/graphics/viewport", "core/interface/keypoll",
         "core/util/frameclock", "core/util/eventhub", "core/util/follower",
         "submersion/actors/submersible", "submersion/actors/fishschool",
         "submersion/actors/creatures/turtle", "submersion/util/layer"],
  function($, SpriteArchive, FollowingViewport, KeyPoll, FrameClock, EventHub,
           Follower, Submersible, FishSchool, Turtle, Layer) {

    var DIMENSIONS = { width: 400, height: 237 };
    var $canvas;
    var Game = Object.create(null);
    var sub;
    var tigerSchoolRight;
    var surgeonSchoolLeft;
    var turtle;


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
      Game.viewport = new FollowingViewport({
        dimensions: DIMENSIONS,
        origin: { x: 0, y: 0 },
        canvasID: "#game-canvas",
        backgroundColor: "#224477",
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
              x: Math.floor(DIMENSIONS.width * 0.5),
              y: Math.floor(DIMENSIONS.height * 0.5)
            },
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
            layer: Layer.frontFocus,
            noncollidables: ["Tiger"],
            count: 30,
            density: 1,
            frameClock: Game.clock,
            velocity: { x: 1.5, y: 0.1 }
          });

          surgeonSchoolLeft = new FishSchool({
            group: "Surgeon",
            sprite: SpriteArchive.get("surgeon-fish-left"),
            center: {
              x: Math.floor(DIMENSIONS.width * 0.75),
              y: Math.floor(DIMENSIONS.height * 0.33)
            },
            layer: Layer.frontFocus,
            noncollidables: ["Surgeon"],
            count: 20,
            density: 1.5,
            frameClock: Game.clock,
            velocity: { x: -1.5, y: -1 }
          });

          turtle = new Turtle({
            group: "Turtle",
            center: {
              x: Math.floor(DIMENSIONS.width * 0.33),
              y: Math.floor(DIMENSIONS.height * 0.33)
            },
            layer: Layer.rearFocus,
            noncollidables: ["Turtle"],
            frameClock: Game.clock,
            velocity: { x: 1, y: 0 }
          });

          new Follower(sub, [{ frame: Game.viewport, followRadius: 25 }]);

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
