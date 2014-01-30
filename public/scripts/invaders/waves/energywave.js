define(['underscore', 'core/graphics/spritearchive', 'core/util/subscriber',
        'invaders/actors/energyenemy'],
  function (_, SpriteArchive, Subscriber, EnergyEnemy) {

    // EnergyWave manages a wave of Energy enemies
    //
    // Arguments:
    //   positionings: An array of objects with two fields, 'center' and
    //                'bounds', where 'center' value is an object with 'x' and
    //                'y' fields, and 'bounds' value is an object with
    //                'ymin', 'xmin', 'xmax', and 'ymax'
    //                fields.
    //   frameClock: instance of a FrameClock
    //   onComplete: function to call when wave has been completed
    var EnergyWave = function (positionings, frameClock, onComplete) {
      // enable as a subscriber
      Subscriber.call(this);

      // initialize instance
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

      this.register('actor.destroy', function (params) {
        wave.enemies = _.reject(wave.enemies, function (e) {
          return params.actor.id() === e.id();
        });

        if (wave.enemies.length === 0) {
          wave.destroy();
          onComplete();
        }
      });
    };
    EnergyWave.prototype = Object.create(Subscriber.prototype);
    EnergyWave.prototype.constructor = EnergyWave;


    return EnergyWave;
  }
);
