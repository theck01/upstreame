define(['underscore', 'core/util/eventhub', 'core/world/collisionframe'],
  function (_, EventHub, CollisionFrame) {

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

      var world = this;
      EventHub.subscribe('actor.new', function (params) {
        world.add(params.actor);
      });
      EventHub.subscribe('actor.destroy', function (params) {
        world.remove(params.actor);
      });
    };


    // add an actor to the world (does not duplicate existing actors)
    //
    // Arguments:
    //   actor: Actor to add to the world
    World.prototype.add = function (actor) {
      this.actors[actor.id()] = actor;
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

      EventHub.trigger('world.step');

      // destroy actors outside of world bounds
      _.each(this.actors, function (a) {
        var p = a.position();
        if (p.x < 0 || p.x >= this.dim.width || p.y < 0 ||
            p.y >= this.dim.height) {
          a.destroy();
        }
      }, this);

      // find and resolve all collisions
      var cFrame = new CollisionFrame(this.dim);
      cFrame.resolve();
    };

    return World;
  }
);
