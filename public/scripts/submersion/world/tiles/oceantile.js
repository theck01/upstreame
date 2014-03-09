define(['underscore', 'core/controller/elementcontroller',
        'submersion/world/tile'],
  function (_, ElementController, Tile) {

    // OceanTile describes a small area within the game world
    //
    // Argument object fields:
    //   origin: object with 'x' and 'y' fields, the origin of the top left
    //           corner of the tile
    //   currentVelocity: object with 'x' and 'y' fields, offset to move actors
    //                    occupying tile area
    var OceanTile = function (origin, currentVelocity) {
      Tile.call(this, origin);
      this.current = _.clone(currentVelocity);
    };
    OceanTile.prototype = Object.create(Tile.prototype);
    OceanTile.prototype.constructor = OceanTile;


    // create an OceanTile instance given a model object
    //
    // Arguments:
    //   model: object with 'x', 'y', and 'currentVelocity' fields
    // Returns: 
    //   An OceanTile instance
    OceanTile.create = function (model) {
      return new OceanTile({ x: model.x, y: model.y }, model.currentVelocity);
    };


    // applyAreaEffect applies some effect to the actor occupying the tiles area
    // overload in subtypes
    //
    // Arguments:
    //   actor: actor instance to apply area affect to
    OceanTile.prototype.applyAreaEffect = function (actor) {
      actor.move(this.current);
    };


    // register element with element controller
    ElementController.register('OceanTile', 'worldtile', OceanTile.create, {
      currentVelocity: { x: 0, y: 0 }
    });


    return OceanTile;
  }
);
