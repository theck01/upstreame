define(['actors/base', 'util/game'], function (Base, Game) {

  // Projectile objects are simple actors that follow a trajectory
  //
  // Arguments:
  //   group: String group name of the object ['Enemy', 'Player', etc]
  //   sprite: Instance of Sprite representing visual object
  //   center: Center of the object, essentially location in the world
  //   layer: Layer that it occupies in a LayeredCanvas heirarchy
  //   noncollidables: Array of strings describing groups with which the new
  //                   instance cannot collide
  //   path: function that takes no arguments that will be added as an instance
  //         method of the current object, describing it's path through space
  //         and returning the next position of the projectile as an object with
  //         'x' and 'y' fields
  var Projectile = function (group, sprite, center, layer, noncollidables,
                             path) {
    Base.call(this, group, sprite, center, layer, noncollidables);
    this.path = path;
  };
  Projectile.prototype = Object.create(Base.prototype);
  Projectile.prototype.constructor = Projectile;


  // overloaded act specific to projectiles
  Projectile.prototype.act = function () {
    this.center = this.path();
  };


  // overloaded collision specific to projectiles
  Projectile.prototype.collision = function () {
    Game.world.remove(this);
  };

  return Projectile;
});
