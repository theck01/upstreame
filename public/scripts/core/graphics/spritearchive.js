define(['underscore', 'core/graphics/sprite'], function (_, Sprite) {
  
  // SpriteArchive loads raw sprites into Sprite objects, and provides
  // a method of retrieval by name
  var SpriteArchive = Object.create(null);
  SpriteArchive.sprites = [];


  // load transforms raw sprites into Sprite objects and stores in the archive
  //
  // Arguments:
  //   rawSprites: An object containing a map of sprite names to objects
  //               containing raw sprite data and the center of the raw sprites
  SpriteArchive.load = function (rawSprites) {
    this.sprites = _.reduce(rawSprites, function (memo, v, k) {
      memo[k] = new Sprite(v.pixels);
      return memo;
    }, Object.create(null));
  };

  // get returns a reference to the Sprite instance associated with the given
  // name
  //
  // Arguments:
  //   spriteName: name of the sprite to retrieve
  SpriteArchive.get = function (spriteName) {
    return this.sprites[spriteName];
  };


  return SpriteArchive;
});
