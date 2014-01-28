define(['underscore', 'core/world/element', 'submersion/util/layer'],
  function (_, Element, Layer) {
  
  var TILE_PROPS = {
    size: 128,
  };

  // Tile describes a small area within the game world
  //
  // Argument object fields:
  //     sprite: Instance of Sprite representing visual object
  //     origin: object with 'x' and 'y' fields, the origin of the top left
  //             corner of the tile
  var Tile = function (opts) {
    Element.call(this, {
      group: ['Scenery'],
      sprite: opts.sprite,
      center: { x: opts.origin.x + Math.floor(TILE_PROPS.size/2),
                y: opts.origin.y + Math.floor(TILE_PROPS.size/2) },
      layer: Layer.nearBackground,
      noncollidables: ['Scenery']
    });
  };
  Tile.prototype = Object.create(Element.prototype);
  Tile.prototype.constructor = Tile;


  // origin returns and object with 'x' and 'y' fields of the origin of the
  // Tile
  Tile.prototype.origin = function () {
    var center = this.position();
    return { x: center.x - Math.floor(TILE_PROPS.size/2),
             y: center.y - Math.floor(TILE_PROPS.size/2) };
  };


  // properties returns an object containing name and values of all tile
  // properties
  Tile.prototype.properties = function () {
    return _.clone(TILE_PROPS);
  };


  return Tile;
});
