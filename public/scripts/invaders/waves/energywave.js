define(['underscore', 'core/graphics/spritearchive', 'core/util/eventhub',
        'invaders/actors/energyenemy'],
  function (_, SpriteArchive, EventHub, EnergyEnemy) {

    // EnergyWave manages a wave of Energy enemies
    //
    // Arguments:
    //   positionings: An array of objects with two fields, 'center' and
    //                'bounds', where 'center' value is an object with 'x' and
    //                'y' fields, and 'bounds' value is an object with
    //                'topmost', 'leftmost', 'rightmost', and 'bottommost'
    //                fields.
    //   frameClock: instance of a FrameClock
    //   onComplete: function to call when wave has been completed
    var EnergyWave = function (positionings, frameClock, onComplete) {
      var wave = this;
      wave.enemies = [];
      _.each(positionings, function (p) {
        wave.enemies.push(new EnergyEnemy({
          group: 'Enemies',
          center: p.center,
          layer: 3,
          noncollidables: ['Enemies'],
          bounds: p.bounds,
          frameClock: frameClock
        }));
      });

      var onDestroy = function (params) {
        wave.enemies = _.reject(wave.enemies, function (e) {
          return params.actor.id() === e.id();
        });

        if (wave.enemies.length === 0) {
          EventHub.unsubscribe('actor.destroy', onDestroy);
          onComplete();
        }
      };

      EventHub.subscribe('actor.destroy', onDestroy);
    };


    return EnergyWave;
  }
);
