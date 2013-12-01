define(['underscore', 'core/actors/base', 'invaders/util/game'],
  function (_, BaseActor, Game) {
    
    // BaseInvader object extends core base actor to form basis for all actors
    // in the space invaders game
    //
    // Arguments:
    //   opts: object with the following required fields
    //     group: String group name of the object ['Enemy', 'Player', etc]
    //     sprite: Instance of Sprite representing visual object
    //     center: Center of the object, essentially location in the world
    //     layer: Layer that it occupies in a LayeredCanvas heirarchy
    //     noncollidables: Array of strings describing groups with which the new
    //                     instance cannot collide
    //   optional fields for the opts param:
    //     onDestroy: extra cleanup that takes place when the actor is destroyed
    var BaseInvader = function (opts) {
      BaseActor.call(this, opts);
      this.onDestroy = opts.onDestroy;
      Game.world.add(this);
    };
    BaseInvader.prototype = Object.create(BaseActor.prototype);
    BaseInvader.prototype.constructor = BaseInvader;

    // destroy actor, removing it from the game world
    // Overload in subtype but ensure that this version is called
    BaseInvader.prototype.destroy = function () {
      Game.world.remove(this);
      if (this.onDestroy) this.onDestroy();
    };

    return BaseInvader;
  }
);
