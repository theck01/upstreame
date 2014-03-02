define(['underscore', 'core/graphics/sprite'], function (_, Sprite) {
  
  // SpriteArchive loads raw sprites into Sprite objects, and provides
  // a method of retrieval by name
  var SpriteArchive = Object.create(null);
  SpriteArchive.sprites = Object.create(null);


  // add stores a sprite and name in the SpriteArchive
  //
  // Arguments:
  //   spriteName: Name of the sprite to add
  //   pixels: Sprite pixels
  SpriteArchive.add = function (spriteName, pixels) {
    this.sprites[spriteName] = new Sprite(pixels);
  };

  // get returns a reference to the Sprite instance associated with the given
  // name
  //
  // Arguments:
  //   spriteName: name of the sprite to retrieve
  SpriteArchive.get = function (spriteName) {
    return this.sprites[spriteName];
  };


  // load transforms raw sprites into Sprite objects and stores in the archive
  //
  // Arguments:
  //   rawSprites: An object containing a map of sprite names to objects
  //               containing raw sprite data and the center of the raw sprites
  SpriteArchive.load = function (rawSprites) {
    _.each(rawSprites, function (v, k) {
      if (v.pixels) this.add(k, v.pixels);
      else this.add(k, v.elements);
    }, this);
  };


  return SpriteArchive;
});
