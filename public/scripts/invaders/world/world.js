define(['underscore', 'core/util/eventhub', 'core/util/subscriber'],
  function (_, EventHub, Subscriber) {

    // World object encapsulates information needed to simulate game world:
    // dimensions, appearance, actors within, etc.
    //
    // Arguments:
    //   dimensions: An object with 'width' and 'height' fields
    var World = function (dimensions) {
      // initialize as a Subscriber
      Subscriber.call(this);

      // initialize world
      this.actors = Object.create(null);
      this.dim = _.clone(dimensions);

      var world = this;

      this.register('actor.new', function (params) {
        world.add(params.actor);
      });
      this.register('actor.destroy', function (params) {
        world.remove(params.actor);
      });
    };
    World.prototype = Object.create(Subscriber.prototype);
    World.prototype.constructor = World;


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
    };

    return World;
  }
);
