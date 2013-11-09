define(['underscore'], function (_) {

  // SHARED VARIABLES
  var serial = 0;

  function intCenter (center) {
    return { x: Math.round(center.x), y: Math.round(center.y) };
  }
  
  // Base object for all actors
  //
  // Arguments:
  //   sprite: Instance of Sprite representing visual object
  //   center: Center of the object, essentially location in the world
  //   layer: Layer that it occupies in a LayeredCanvas heirarchy
  //   noncollidables: Array of strings describing types with which the new
  //                instance cannot collide
  var Base = function (sprite, center, layer, noncollidables) {
    this.serial = ('000000' + serial++).slice(-7);
    this.type = 'Base';
    this.sprite = sprite;
    this.center = _.clone(center);
    this.layer = layer;
    this.noncollidables = _.reduce(noncollidables, function (memo, c) {
      memo[c] = true;
      return memo;
    }, Object.create(null));
  };


  // act method should be overloaded by subclasses of Base, method is called
  // once per game loop, and should update the actor to handle the current
  // game state
  Base.prototype.act = function () {
    throw new Error('Base.act called, subclass must override');
  };

  
  // collision resolves the effects of a collision on this actor.
  // Overload in subtype
  Base.prototype.collision = function () {
    console.log(this.id() + ' experienced a collision!');
  };


  // id gets the actors serial number as a 7 digit string
  //
  // Return:
  //   7 digit numeric string
  Base.prototype.id = function () {
    return this.serial;
  };


  // paint the actor's sprite onto a canvas
  //
  // Arguments:
  //   canvas: An instance of *Canvas to paint this actors sprite on
  Base.prototype.paint = function (canvas) {
    this.sprite.paint(canvas, intCenter(this.center), this.layer);
  };


  // pixels that the actor occupies
  //
  // Returns an array of objects with 'x' and 'y' integer fields
  Base.prototype.pixels = function () {
    return this.sprite.pixels(intCenter(this.center));
  };


  // possibleCollision checks to see if this and the argument can collide, and
  // if so delegates collision handling to collision method
  Base.prototype.possibleCollision = function (actor) {
    if (!this.noncollidables[actor.type]) this.collision();
  };

  return Base;
});
