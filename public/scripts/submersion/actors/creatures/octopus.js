define(['submersion/actors/seacreature', 'submersion/util/group'],
  function (SeaCreature, Group) {

    // Octopus, a simple octopus that swims in on direction
    //
    // Argument object fields:
    //   center: Center of the object, essentially location in the world
    //   layer: Layer that it occupies in a LayeredCanvas heirarchy
    //   frameClock: frameClock that drives animation
    //   velocity: Object with 'x' and 'y' fields
    var Octopus = function (opts) {
      opts.animation = [
        { spriteName: 'swimming-octopus-0-1', frames: 25 },
        { spriteName: 'swimming-octopus-0-2', frames: 11 },
        { spriteName: 'swimming-octopus-0-3', frames: 11 },
        { spriteName: 'swimming-octopus-0-4', frames: 17 },
        { spriteName: 'swimming-octopus-0-3', frames: 6 },
        { spriteName: 'swimming-octopus-0-2', frames: 4 }
      ];
      opts.group = 'Turtle';
      opts.noncollidables = Group.collect('friendlies');

      SeaCreature.call(this, opts);
    };
    Octopus.prototype = Object.create(SeaCreature.prototype);
    Octopus.prototype.constructor = Octopus;

    
    return Octopus;
  }
);
