define(['core/controller/elementcontroller', 'submersion/world/tile'],
  function (ElementController, Tile) {

    // OceanTile describes a small area within the game world
    //
    // Argument object fields:
    //   origin: object with 'x' and 'y' fields, the origin of the top left
    //           corner of the tile
    //   currentVelocity: object with 'x' and 'y' fields, offset to move actors
    //                    occupying tile area
    var NullTile = function (origin) {
      Tile.call(this, origin);
    };
    NullTile.prototype = Object.create(Tile.prototype);
    NullTile.prototype.constructor = NullTile;


    // create an OceanTile instance given a model object
    //
    // Arguments:
    //   model: object with 'x', 'y', and 'currentVelocity' fields
    // Returns: 
    //   An OceanTile instance
    NullTile.create = function (model) {
      return new NullTile({ x: model.x, y: model.y });
    };


    // applyAreaEffect applies some effect to the actor occupying the tiles area
    // overload in subtypes 
    //
    // Arguments:
    //   actor: actor instance to apply area affect to
    NullTile.prototype.applyAreaEffect = function (actor) {
      actor.destroy();
    };


    // register element with element controller
    ElementController.register('NullTile', 'worldtile', NullTile.create, {});


    return NullTile;
  }
);
