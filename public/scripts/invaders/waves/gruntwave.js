define(['underscore', 'core/graphics/spritearchive', 'invaders/actors/grunt',
        'invaders/util/game'],
  function (_, SpriteArchive, Grunt, Game) {

    // GruntWave manages a wave of Grunt enemies
    //
    // Arguments:
    //   positionings: An array of objects with two fields, 'center' and
    //                'bounds', where 'center' value is an object with 'x' and
    //                'y' fields, and 'bounds' value is an object with
    //                'topmost', 'leftmost', 'rightmost', and 'bottommost'
    //                fields.
    var GruntWave = function (positionings) {
      this.positionings = positionings;
    };


    // start begins the wave and calls onComplete when wave objective (all
    // enemies destroyed) has been completed
    //
    // Arguments:
    //   onComplete: function that takes no arguments, called when wave ends
    GruntWave.prototype.start = function (onComplete) {
      var gruntCount = this.positionings.length;

      var wave = this;
      _.each(wave.positionings, function (p) {
        new Grunt({
          group: 'Enemies',
          center: p.center,
          layer: 3,
          noncollidables: ['Enemies'],
          bounds: p.bounds,
          frameClock: Game.clock,
          onDestroy: function () {
            if (--gruntCount === 0) onComplete();
          }
        });
      });
    };


    return GruntWave;
  }
);
