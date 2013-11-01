define(['underscore'], function (_) {

  // CONSTANT Pixels per frame
  var BASE_SPEED = 2;


  // SHARED VARIABLES
  var serial = 0;
  
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
    this.sprite.paint(canvas, this.center, this.layer);
  };


  // pixels that the actor occupies
  //
  // Returns an array of objects with 'x' and 'y' integer fields
  Base.prototype.pixels = function () {
    return this.sprite.pixels(this.center);
  };


  // possibleCollision checks to see if this and the argument can collide, and
  // if so delegates collision handling to collision method
  Base.prototype.possibleCollision = function (actor) {
    if (!this.noncollidables[actor.type]) this.collision();
  };


  // phift the actor on the screen in each direction
  //
  // Argument:
  //   directions: Array of strings from the set:
  //               [ 'UP', 'DOWN', 'LEFT', 'RIGHT' ]
  Base.prototype.shift = function (directions) {
    _.each(directions, function (d) {
      if (d === 'UP') this.center.y -= BASE_SPEED;
      else if (d === 'DOWN') this.center.y += BASE_SPEED;
      else if (d === 'LEFT') this.center.x -= BASE_SPEED;
      else if (d === 'RIGHT') this.center.x += BASE_SPEED;
    }, this);
  };


  return Base;
});
