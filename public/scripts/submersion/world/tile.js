define(['underscore', 'core/util/frame'], function (_, Frame) {

  var OCEAN_TILE_PROPS = {
    dimensions: { width: 128, height: 128 }
  };

  // OceanTile describes a small area within the game world
  //
  // Argument object fields:
  //   origin: object with 'x' and 'y' fields, the origin of the top left
  //           corner of the tile
  //   currentVelocity: object with 'x' and 'y' fields, offset to move actors
  //                    occupying tile area
  var OceanTile = function (origin, currentVelocity) {
    Frame.call(this, OCEAN_TILE_PROPS.dimensions, origin);
    this.current = _.clone(currentVelocity);
  };
  OceanTile.prototype = Object.create(Frame.prototype);
  OceanTile.prototype.constructor = OceanTile;


  // applyAreaEffect applies some effect to the actor occupying the tiles area
  // overload in subtypes but be sure to call OceanTile version to apply current
  //
  // Arguments:
  //   actor: actor instance to apply area affect to
  OceanTile.prototype.applyAreaEffect = function (actor) {
    actor.move(this.current);
  };


  // properties returns an object containing name and values of all tile
  // properties
  OceanTile.properties = function () {
    return _.clone(OCEAN_TILE_PROPS);
  };


  return OceanTile;
});
