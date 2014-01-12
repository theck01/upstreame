require.config({
  baseUrl: "scripts",
  paths: {
    bootstrap: "/bootstrap/dist/js/bootstrap.min",
    jquery: "/jquery/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "core/graphics/spritearchive", "core/graphics/viewport",
         "core/interface/keypoll", "core/util/frameclock",
         "submersion/actors/submersible", "submersion/actors/fishschool"],
  function($, SpriteArchive, Viewport, KeyPoll, FrameClock, Submersible,
           FishSchool) {

    var DIMENSIONS = { width: 800, height: 475 };
    var $canvas;
    var Game = Object.create(null);
    var sub;
    var surgeonSchoolRight;
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
      sub.act();
      surgeonSchoolRight.act();
      surgeonSchoolLeft.act();
      Game.viewport.render(sub);
      Game.viewport.render(surgeonSchoolRight);
      Game.viewport.render(surgeonSchoolLeft);
      Game.viewport.paint();
      requestAnimationFrame(mainLoop);
    }


    $(function () {
      $canvas = $("#game-canvas");
      Game.keys = new KeyPoll();
      Game.viewport = new Viewport(DIMENSIONS, { x: 0, y: 0 }, "#game-canvas",
                                   "#247");
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

          surgeonSchoolRight = new FishSchool({
            group: "Surgeon",
            sprite: SpriteArchive.get("surgeon-fish-right"),
            center: {
              x: Math.floor(DIMENSIONS.width * 0.75),
              y: Math.floor(DIMENSIONS.height * 0.66)
            },
            layer: 3,
            noncollidables: ["Surgeon"],
            count: 20,
            density: 1.5,
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
