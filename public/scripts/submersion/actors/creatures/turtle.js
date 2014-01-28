define(['submersion/actors/seacreature'], function (SeaCreature) {

  // Turtle, a simple sea turtle that swims in on direction
  //
  // Argument object fields:
  //   group: String group name of the object ['Enemy', 'Player', etc]
  //   center: Center of the object, essentially location in the world
  //   layer: Layer that it occupies in a LayeredCanvas heirarchy
  //   noncollidables: Array of strings describing groups with which the new
  //                   instance cannot collide
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

    SeaCreature.call(this, opts);
  };
  Turtle.prototype = Object.create(SeaCreature.prototype);
  Turtle.prototype.constructor = Turtle;

  
  return Turtle;
});
