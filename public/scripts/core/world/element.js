define(['underscore', 'core/util/bounds', 'core/util/subscriber'],
  function (_, Bounds, Subscriber) {

    function intCenter (center) {
      return { x: Math.round(center.x), y: Math.round(center.y) };
    }
    
    // Element foundation object for all elements, static scenery, etc.
    //
    // Arguments:
    //   opts: object with the following required fields
    //     group: String group name of the object ['Enemy', 'Player', etc]
    //     sprite: Instance of Sprite representing visual object
    //     center: Center of the object, essentially location in the world
    //     layer: Layer that it occupies in a LayeredCanvas heirarchy
    //     noncollidables: Array of strings describing groups with which the new
    //                     instance cannot collide
    var Element = function (opts) {
      // initialize as a Subscriber
      Subscriber.call(this);

      // intialize variables
      this.serial = _.uniqueId('element');
      this.group = opts.group;
      this.sprite = opts.sprite;
      this.center = _.clone(opts.center);
      this.lyr = opts.layer;
      this.visible = false;
      this.dynamic = false;
      this.noncollidables = _.reduce(opts.noncollidables, function (memo, c) {
        memo[c] = true;
        return memo;
      }, Object.create(null));

      var element = this;
      this.register('viewport.render', function (params) {
        element.visible = Bounds.intersect(element.bounds(),
                                           params.viewport.bounds());
        if (element.isVisible()) params.viewport.render(element);
      });
      this.register('actionbox.collisions', function (params) {
        element.dynamic = Bounds.intersect(element.bounds(),
                                           params.actionbox.bounds());
        if (element.isDynamic()) params.actionbox.set(element);
      });
    };
    Element.prototype = Object.create(Subscriber.prototype);
    Element.prototype.constructor = Element;


    // bounds method returns the bounds of the element
    Element.prototype.bounds = function () {
      var bounds = this.sprite.bounds();
      bounds.xmin += this.center.x;
      bounds.xmax += this.center.x;
      bounds.ymin += this.center.y;
      bounds.ymax += this.center.y;
      return bounds;
    };

    
    // collision resolves the effects of a collision on this element.
    // Overload in subtype
    Element.prototype.collision = function () {
      throw new Error('Element#collision called, subclass must override');
    };


    // id gets the elements unique id
    //
    // Return:
    //   7 digit numeric string
    Element.prototype.id = function () {
      return this.serial;
    };


    // isDynamic returns true if the element is within the actionbox bounds
    // an should be involved in collision detection
    Element.prototype.isDynamic = function () {
      return this.dynamic;
    };


    // isVisible returns true if the element is being rendered to the screen
    Element.prototype.isVisible = function () {
      return this.visible;
    };


    // layer gets layer that element occupies in the drawing heirarchy
    //
    // Return:
    //   Integer layer number
    Element.prototype.layer = function () {
      return this.lyr;
    };


    // pixels that the element occupies
    //
    // Returns an array of objects with 'x' and 'y' integer fields
    Element.prototype.pixels = function () {
      return this.sprite.pixels(intCenter(this.center));
    };


    // position in space that the element occupies
    //
    // Returns an object with 'x' and 'y' integer fields
    Element.prototype.position = function () {
      return intCenter(this.center);
    };


    // possibleCollision checks to see if this and the argument can collide, and
    // if so delegates collision handling to collision method, passing the
    // the method the collided object as an optional parameter
    Element.prototype.possibleCollision = function (element) {
      if (!this.noncollidables[element.group]) this.collision(element);
    };


    return Element;
  }
);
