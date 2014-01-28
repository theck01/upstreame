define(['underscore', 'core/util/eventhub', 'core/world/element'],
  function (_, EventHub, Element) {

    function intCenter (center) {
      return { x: Math.round(center.x), y: Math.round(center.y) };
    }


    // Base object for all actors
    //
    // Arguments:
    //   opts: object with the following required fields
    //     group: String group name of the object ['Enemy', 'Player', etc]
    //     sprite: Instance of Sprite representing visual object
    //     center: Center of the object, essentially location in the world
    //     layer: Layer that it occupies in a LayeredCanvas heirarchy
    //     noncollidables: Array of strings describing groups with which the new
    //                     instance cannot collide
    var Base = function (opts) {
      Element.call(this, opts);

      var actor = this;
      this.register('world.step', function () {
        if (actor.isVisible()) actor.act();
      });

      EventHub.trigger('actor.new', { actor: this });
    };
    Base.prototype = Object.create(Element.prototype);
    Base.prototype.constructor = Base;



    // act method should be overloaded by subclasses of Base, method is called
    // once per game loop, and should update the actor to handle the current
    // game state
    Base.prototype.act = function () {
      throw new Error('Base#act called, subclass must override');
    };


    // destroy actor, removing it from the game world
    // Overload in subtype
    Base.prototype.destroy = function () {
      Element.prototype.destroy.call(this);
      EventHub.trigger('actor.destroy', { actor: this });
    };


    // move relocates the actor, either by shifting the actor by an offset or
    // relocating to an absolute location
    //
    // Arguments:
    //   coord: offset or absolute position used in relocation
    //   method: Optional, can be any of the following strings:
    //     'shift': Default, shift actor by coord offset
    //     'absolute': move actor to absolute position coord
    Base.prototype.move = function (coord, method) {
      method = method || 'shift';
      var origin = intCenter(this.center);
      var ending;

      if (method === 'absolute') {
        this.center.x = coord.x;
        this.center.y = coord.y;
        ending = intCenter(coord);
      }
      else {
        this.center.x += coord.x;
        this.center.y += coord.y;
        ending = intCenter(this.center);
      }

      if (!_.isEqual(origin, ending)) {
        EventHub.trigger('actor.move',
                         { actor: this, from: origin, to: ending });
      }
    };

    return Base;
  }
);
