define(['underscore', 'world/collisionframe'], function (_, CollisionFrame) {

  // World object encapsulates information needed to simulate game world:
  // dimensions, appearance, actors within, etc.
  //
  // Arguments:
  //   dimensions: An object with 'width' and 'height' fields
  //   background: Background object
  var World = function (dimensions, background) {
    this.actors = Object.create(null);
    this.dim = _.clone(dimensions);
    this.background = background;
  };


  // add an actor to the world (does not duplicate existing actors)
  //
  // Arguments:
  //   actor: Actor to add to the world
  World.prototype.add = function (actor) {
    this.actors[actor.id()] = actor;
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
    delete this.actors[actor.id()];
  };


  // timestep advances the world simulation by one time unit, giving all
  // actors a chance to act and collisions to be resolved
  World.prototype.timestep = function () {
    var cFrame = new CollisionFrame(this.dim);

    _.each(this.actors, function (a) {
      a.act();
      cFrame.set(a);
    });
    
    cFrame.resolve();

    // remove actors from 
    _.each(this.actors, function (a) {
      var p = a.position();
      if (p.x < 0 || p.x >= this.dim.width || p.y < 0 ||
          p.y >= this.dim.height) {
        this.remove(a);
      }
    }, this);
  };

  return World;
});
