define(['underscore', 'core/graphics/spritearchive',
        'invaders/actors/energyenemy', 'invaders/util/game'],
  function (_, SpriteArchive, EnergyEnemy, Game) {

    // EnergyWave manages a wave of Energy enemies
    //
    // Arguments:
    //   positionings: An array of objects with two fields, 'center' and
    //                'bounds', where 'center' value is an object with 'x' and
    //                'y' fields, and 'bounds' value is an object with
    //                'topmost', 'leftmost', 'rightmost', and 'bottommost'
    //                fields.
    var EnergyWave = function (positionings) {
      this.positionings = positionings;
    };


    // start begins the wave and calls onComplete when wave objective (all
    // enemies destroyed) has been completed
    //
    // Arguments:
    //   onComplete: function that takes no arguments, called when wave ends
    EnergyWave.prototype.start = function (onComplete) {
      var energyEnemyCount = this.positionings.length;

      var wave = this;
      _.each(wave.positionings, function (p) {
        new EnergyEnemy({
          group: 'Enemies',
          center: p.center,
          layer: 3,
          noncollidables: ['Enemies'],
          bounds: p.bounds,
          frameClock: Game.clock,
          onDestroy: function () {
            if (--energyEnemyCount === 0) onComplete();
          }
        });
      });
    };


    return EnergyWave;
  }
);
