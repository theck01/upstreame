define(['underscore', 'world/collisionframe'], function (_, CollisionFrame) {

  // World object encapsulates information needed to simulate game world:
  // dimensions, appearance, actors within, etc.
  //
  // Arguments:
  //   dimensions: An object with 'x' and 'y' fields
  //   background: Background object
  var World = function (dimensions, background) {
    this.actors = [];
    this.dim = dimensions;
    this.background = background;
  };


  // add an actor to the world (does not duplicate existing actors)
  //
  // Arguments:
  //   actor: Actor to add to the world
  World.prototype.add = function (actor) {
    this.remove(actor);
    this.actors.push(actor);
  };


  // paint renders any background image and all actors in the world to the
  // canvas
  World.prototype.paint = function (canvas) {
    if (this.background) this.background.paint(canvas);

    _.each(this.actors, function (a) {
      a.paint(canvas);
    });
  };


  // remove an actor from the world
  //
  // Arguments:
  //   actor: Actor to remove from the world
  World.prototype.remove = function (actor) {
    this.actors = _.filter(this.actors, function (a) {
      return actor.id() !== a.id();
    });
  };


  // timestep advances the world simulation by one time unit, giving all
  // actors a chance to act and collisions to be resolved
  World.prototype.timestep = function () {
    var cFrame = new CollisionFrame(this.dim.x, this.dim.y);

    _.each(this.actors, function (a) {
      a.act();
      cFrame.set(a);
    });
    
    cFrame.resolve();
  };

  return World;
});
