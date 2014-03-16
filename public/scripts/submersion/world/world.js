define(['underscore', 'core/util/encoder', 'core/controller/eventhub',
        'core/util/subscriber','submersion/world/oceantile'],
  function (_, Encoder, EventHub, Subscriber, OceanTile) {

    // World encapsulates all information about the game world in a set of 
    // tiles, each tile describing a small area of the world.
    //
    // Arguments:
    //   tileset: An array of objects containing 'gridPosition' and 'tile'
    //            fields, gridPosition associated with an object with 'x' and
    //            'y' fields denoting tile location within grid of tiles, 'tile'
    //            associated with OceanTile instance. Tiles may not have
    //            negative grid positions
    //   actors: An array of actor objects created before the world
    var World = function (tileset, actors) {
      Subscriber.call(this);

      this.bounds = _.reduce(tileset, function(memo, to) {
        if (memo.xmin > to.gridPosition.x) memo.xmin = to.gridPosition.x;
        if (memo.xmax < to.gridPosition.x) memo.xmax = to.gridPosition.x;
        if (memo.ymin > to.gridPosition.y) memo.ymin = to.gridPosition.y;
        if (memo.ymax < to.gridPosition.y) memo.ymax = to.gridPosition.y;
        return memo;
      }, { xmin: Infinity, xmax: -Infinity, ymin: Infinity, ymax: -Infinity });

      if (this.bounds.xmin < 0 || this.bounds.ymin < 0) {
        throw new Error('World created with tile in negative grid positions');
      }

      this.encoderDim = { x: this.bounds.xmax, y: this.bounds.xmin };
      this.tiles = Object.create(null);
      _.each(tileset, function (to) {
        var scalar = Encoder.coordToScalar(to.gridPosition, this.encoderDim);
        this.tiles[scalar] = to.tile;
      }, this);

      this.actorOccupancies = Object.create(null);
      _.each(actors, function (a) {
        this._addActor(a);
      }, this);

      var w = this;
      this.register('actor.new', function (params) {
        w._updateActor(params.actor);
      });
      this.register('actor.destroy', function (params) {
        delete w.actors[params.actors.id()];
      });
      this.register('actor.move', function (params) {
        w._updateActor(params.actor);
      });
    };
    World.prototype = Object.create(Subscriber.prototype);
    World.prototype.constructor = World;


    // destroy a World instance
    World.prototype.destroy = function () {
      Subscriber.prototype.destroy.call(this);
      this.actorOccupancies = null;
    };


    // step advances world simulation by 1 timestep
    World.prototype.step = function () {
      _.each(this.actorOccupancies, function (ao) {
        ao.occupiedTile.applyAreaAffect(ao.actor);
      });

      EventHub.trigger('world.step');
    };


    // tileAt returns the tile that contains the postition specified
    World.prototype._tileAt = function (position) {
      var width = OceanTile.properties().dimensions.width;
      var height = OceanTile.properties().dimensions.height;
      var tilePos = { x: Math.floor(position.x/width),
                      y: Math.floor(position.y/height) };
      var scalar = Encoder.coordToScalar(tilePos, this.encoderDim);
      return this.tiles[scalar];
    };


    // _updateActor integrates an actor object into the world, adding it if it
    // doesnt exist else updating data if it does
    //
    // Arguments:
    //   actor: instance of an actor 
    World.prototype._updateActor = function (actor) {
      this.actorOccupancies[actor.id()] = {
        actor: actor,
        occupiedTile: this._tileAt(actor.position)
      };
    };


    return World;
  }
);
