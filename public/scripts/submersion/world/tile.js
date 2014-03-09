define(['underscore', 'core/util/frame'], function (_, Frame) {

  var TILE_PROPS = {
    dimensions: { width: 128, height: 128 }
  };

  // Tile describes a small area within the game world
  //
  // Argument object fields:
  //   origin: object with 'x' and 'y' fields, the origin of the top left
  //           corner of the tile
  var Tile = function (origin) {
    Frame.call(this, TILE_PROPS.dimensions, origin);
  };
  Tile.prototype = Object.create(Frame.prototype);
  Tile.prototype.constructor = Tile;


  // applyAreaEffect applies some effect to the actor occupying the tiles area
  // overload
  //
  // Arguments:
  //   actor: actor instance to apply area affect to
  Tile.prototype.applyAreaEffect = function () {
    throw new Error('Cannot call applyAreaEffect on Tile instance');
  };


  // properties returns an object containing name and values of all tile
  // properties
  Tile.properties = function () {
    return _.clone(TILE_PROPS);
  };


  return Tile;
});
