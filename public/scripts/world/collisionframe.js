define(['underscore', 'util/encoder'], function (_, Encoder) {

  // CollisionFrame object detects collisions on a plane of width x height
  // metapixels
  //
  // Arguments:
  //   width: width of the world in meta pixels
  //   height: height of the world in meta pixels
  var CollisionFrame = function (width, height) {
    this.dim = { width: width, height: height };
    this.world = Object.create(null);
    this.collisions = Object.create(null);
    this.actors = Object.create(null);
  };


  // resolves all collisions that have occured within the frame by calling
  // possibleCollision method on each pair of actors reflexively
  CollisionFrame.prototype.resolve = function () {
    _.each(this.collisions, function (v) {
      v[0].possibleCollision(v[1]);
      v[1].possibleCollision(v[0]);
    });
  };


  // set maps an array of pixels to an actor object within the world, tracking
  // any collisions that occur due to that actor
  //
  // Arguments:
  //   actor: the actor object to be included in the frame
  CollisionFrame.prototype.set = function (actor) {

    // if actor has already been added to this frame, do nothing
    if (this.actors[actor.id()]) return;

    // add all pixels to collision frame's world
    _.each(actor.pixels(), function (p) {
      // only add on screen elements to collision frame
      if (p.x >= this.dim.width || p.x < 0 || p.y >= this.dim.height ||
          p.y < 0) {
        return;
      }
      var scalar = Encoder.coordToScalar(p, this.dim);

      // if other actors occupy the same pixel, update collisions with the
      // current actor
      if (this.world[scalar]) {
        _.each(this.world[scalar], function (a) {
          var key;
          if (a.id() < actor.id()) key = a.id() + actor.id();
          else key = actor.id + a.id();

          this.collisions[key] = [a, actor];
        }, this);
        this.world[scalar].push(actor);
      }
      else this.world[scalar] = [actor];
    }, this);

    this.actors[actor.id()] = true;
  };


  return CollisionFrame;
});
