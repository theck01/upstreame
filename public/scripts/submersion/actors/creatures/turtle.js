define(['submersion/actors/seacreature', 'submersion/util/group'],
  function (SeaCreature, Group) {

    // Turtle, a simple sea turtle that swims in on direction
    //
    // Argument object fields:
    //   center: Center of the object, essentially location in the world
    //   layer: Layer that it occupies in a LayeredCanvas heirarchy
    //   frameClock: frameClock that drives animation
    //   velocity: Object with 'x' and 'y' fields
    var Turtle = function (opts) {

      var direction = 'left';
      if (opts.velocity.x >= 0) direction = 'right';

      opts.animation = [
        { spriteName: 'sea-turtle-down-' + direction, frames: 30 },
        { spriteName: 'sea-turtle-flat-' + direction, frames: 10 },
        { spriteName: 'sea-turtle-up-' + direction, frames: 10 },
        { spriteName: 'sea-turtle-flat-' + direction, frames: 10 }
      ];
      opts.group = 'Turtle';
      opts.noncollidables = Group.collect('friendlies');

      SeaCreature.call(this, opts);
    };
    Turtle.prototype = Object.create(SeaCreature.prototype);
    Turtle.prototype.constructor = Turtle;

    
    return Turtle;
  }
);
