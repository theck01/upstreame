define(['underscore'], function (_) {

  // CONSTANT Pixels per frame
  var BASE_SPEED = 3;

  
  // Base object for all actors
  //
  // Arguments:
  //   sprite: Instance of Sprite representing visual object
  //   center: Center of the object, essentially location in the world
  //   layer: Layer that it occupies in a LayeredCanvas heirarchy
  //   collidables: Array of objects with which an instance of Base can
  //                collide
  var Base = function (sprite, center, layer, collidables) {
    this.type = 'Base';
    this.sprite = sprite;
    this.center = _.clone(center);
    this.layer = layer;
    this.collidables = _.reduce(collidables, function (memo, c) {
      memo[c] = true;
      return memo;
    }, Object.create(null));
  };


  // Shift the actor on the screen in each direction
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


  // Paint the actor's sprite onto a canvas
  //
  // Arguments:
  //   canvas: An instance of *Canvas to paint this actors sprite on
  Base.prototype.paint = function (canvas) {
    this.sprite.paint(canvas, this.center, this.layer);
  };


  return Base;
});
