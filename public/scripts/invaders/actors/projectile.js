define(['core/actors/base'], function (Base) {

  // Projectile objects are simple actors that follow a trajectory
  //
  // Arguments:
  //   opts: object with the following required fields
  //     group: String group name of the object ['Enemy', 'Player', etc]
  //     sprite: Instance of Sprite representing visual object
  //     center: Center of the object, essentially location in the world
  //     layer: Layer that it occupies in a LayeredCanvas heirarchy
  //     noncollidables: Array of strings describing groups with which the new
  //                     instance cannot collide
  //     path: function that takes no arguments that will be added as an
  //           instance method of the current object, describing it's path
  //           through space and returning the next position of the projectile
  //           as an object with 'x' and 'y' fields
  var Projectile = function (opts) {
    Base.call(this, opts);
    this.path = opts.path;
  };
  Projectile.prototype = Object.create(Base.prototype);
  Projectile.prototype.constructor = Projectile;


  // overloaded act specific to projectiles
  Projectile.prototype._act = function () {
    this.move(this.path(), 'absolute');
  };


  // overloaded collision specific to projectiles
  Projectile.prototype._collision = function () {
    this.destroy();
  };

  return Projectile;
});
