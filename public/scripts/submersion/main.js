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
         "submersion/actors/submersible"],
  function($, SpriteArchive, Viewport, KeyPoll, FrameClock, Submersible) {

    var DIMENSIONS = { width: 600, height: 350 };
    var $canvas;
    var Game = Object.create(null);
    var sub;


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
      Game.viewport.render(sub);
      Game.viewport.paint();
      requestAnimationFrame(mainLoop);
    }


    $(function () {
      $canvas = $("#game-canvas");
      Game.keys = new KeyPoll();
      Game.viewport = new Viewport(DIMENSIONS, { x: 0, y: 0 }, "#game-canvas",
                                   "#000077");
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
