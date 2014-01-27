define(['underscore', 'core/util/bounds', 'core/util/eventhub'],
  function (_, Bounds, EventHub) {

    // Actor Events Emitted:
    // 'actor.new': event listeners receive an object with 'actor' field
    //              containing new actor. triggered on instantiation
    // 'actor.destroy': event listeners receive an object with 'actor' field
    //                  containing to be destroyed actor. triggered on
    //                  destruction
    // 'actor.move': event listeners receive an object with 'actor', 'from' and
    //               'to' fields, each containing an object that has 'x' and 'y'
    //               fields. triggered when actor is relocated
    // Actor Events Respond to:
    // 'viewport.render'
    // 'collisionframe.resolve'
    // 'world.step'
    

    // SHARED VARIABLES
    var serial = 0;

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
      // intialize variables
      this.serial = ('000000' + serial++).slice(-7);
      this.group = opts.group;
      this.sprite = opts.sprite;
      this.center = _.clone(opts.center);
      this.lyr = opts.layer;
      this.visible = false;
      this.noncollidables = _.reduce(opts.noncollidables, function (memo, c) {
        memo[c] = true;
        return memo;
      }, Object.create(null));

      var actor = this;
      this.subscriptions = {
        onViewportRender: function (params) {
          actor.visible = Bounds.intersect(actor.bounds(),
                                           params.viewport.bounds());
          if (actor.visible) params.viewport.render(actor);
        },
        onCollisionFrameResolve: function (params) {
          if (actor.visible) params.collisionframe.set(actor);
        },
        onWorldStep: function () {
          if (actor.visible) actor.act();
        }
      };

      EventHub.subscribe('viewport.render',
                         this.subscriptions.onViewportRender);
      EventHub.subscribe('collisionframe.resolve',
                         this.subscriptions.onCollisionFrameResolve);
      EventHub.subscribe('world.step', this.subscriptions.onWorldStep);

      // setup events 
      EventHub.trigger('actor.new', { actor: this });
    };


    // act method should be overloaded by subclasses of Base, method is called
    // once per game loop, and should update the actor to handle the current
    // game state
    Base.prototype.act = function () {
      throw new Error('Base#act called, subclass must override');
    };


    // bounds method returns the bounds of the actor
    Base.prototype.bounds = function () {
      var bounds = this.sprite.bounds();
      bounds.xmin += this.center.x;
      bounds.xmax += this.center.x;
      bounds.ymin += this.center.y;
      bounds.ymax += this.center.y;
      return bounds;
    };

    
    // collision resolves the effects of a collision on this actor.
    // Overload in subtype
    Base.prototype.collision = function () {
      throw new Error('Base#collision called, subclass must override');
    };


    // destroy actor, removing it from the game world
    // Overload in subtype
    Base.prototype.destroy = function () {
      EventHub.unsubscribe('viewport.render',
                           this.subscriptions.onViewportRender);
      EventHub.unsubscribe('collisionframe.resolve',
                           this.subscriptions.onCollisionFrameResolve);
      EventHub.unsubscribe('world.step', this.subscriptions.onWorldStep);
      EventHub.trigger('actor.destroy', { actor: this });
    };


    // id gets the actors serial number as a 7 digit string
    //
    // Return:
    //   7 digit numeric string
    Base.prototype.id = function () {
      return this.serial;
    };


    // layer gets layer that actor occupies in the drawing heirarchy
    //
    // Return:
    //   Integer layer number
    Base.prototype.layer = function () {
      return this.lyr;
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


    // pixels that the actor occupies
    //
    // Returns an array of objects with 'x' and 'y' integer fields
    Base.prototype.pixels = function () {
      return this.sprite.pixels(intCenter(this.center));
    };


    // position in space that the actor occupies
    //
    // Returns an object with 'x' and 'y' integer fields
    Base.prototype.position = function () {
      return { x: Math.floor(this.center.x), y: Math.floor(this.center.y) };
    };


    // possibleCollision checks to see if this and the argument can collide, and
    // if so delegates collision handling to collision method
    Base.prototype.possibleCollision = function (actor) {
      if (!this.noncollidables[actor.group]) this.collision();
    };

    return Base;
  }
);
