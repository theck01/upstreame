define(['underscore', 'util/game'], function (_, Game) {

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
    this.serial = ('000000' + serial++).slice(-7);
    this.group = opts.group;
    this.sprite = opts.sprite;
    this.center = _.clone(opts.center);
    this.layer = opts.layer;
    this.noncollidables = _.reduce(opts.noncollidables, function (memo, c) {
      memo[c] = true;
      return memo;
    }, Object.create(null));

    Game.world.add(this);
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


  // destroy actor, removing it from the game world
  // Overload in subtype but ensure that this version is called
  Base.prototype.destroy = function () {
    Game.world.remove(this);
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
  Base.prototype.paint = function () {
    this.sprite.paint(Game.canvas, intCenter(this.center), this.layer);
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
});
