define(['underscore', 'core/graphics/sprite'], function (_, Sprite) {
  
  // SpriteArchive loads raw sprites into Sprite objects, and provides
  // a method of retrieval by name
  //
  // Arguments:
  //   rawSprites: An object containing a map of sprite names to objects
  //               containing raw sprite data and the center of the raw sprites
  var SpriteArchive = function (rawSprites) {
    this.sprites = _.reduce(rawSprites, function (memo, v, k) {
      memo[k] = new Sprite(v.pixels, v.center);
      return memo;
    }, Object.create(null));
  };


  // get returns a reference to the Sprite instance associated with the given
  // name
  //
  // Arguments:
  //   spriteName: name of the sprite to retrieve
  SpriteArchive.prototype.get = function (spriteName) {
    return this.sprites[spriteName];
  };


  return SpriteArchive;
});
