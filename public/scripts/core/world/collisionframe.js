define(['underscore', 'core/util/encoder'], function (_, Encoder) {

  // CollisionFrame object detects collisions on a plane of width x height
  // metapixels
  //
  // Arguments:
  //   dimensions: An object with 'width' and 'height' fields
  var CollisionFrame = function (dimensions) {
    this.dim = _.clone(dimensions);
    this.world = Object.create(null);
    this.collisions = Object.create(null);
    this.elements = Object.create(null);
  };


  // clear removes all collisions that have already been detected
  CollisionFrame.prototype.clear = function () {
    this.world = Object.create(null);
    this.collisions = Object.create(null);
    this.elements = Object.create(null);
  };


  // resolves all collisions that have occured within the frame by calling
  // possibleCollision method on each pair of elements reflexively
  CollisionFrame.prototype.resolve = function () {
    _.each(this.collisions, function (v) {
      v[0].possibleCollision(v[1]);
      v[1].possibleCollision(v[0]);
    });
  };


  // set maps an coordinate to an element object within the world, 
  // tracking any collisions that occur due to that element
  //
  // Arguments:
  //   element: the element object to be included in the frame
  //   pos: discrete position to set that the element occupies (commonly
  //        called for each pixel in an element once
  CollisionFrame.prototype.set = function (element, pos) {
    // only add bounded pos to collision frame
    if (pos.x >= this.dim.width || pos.x < 0 ||
        pos.y >= this.dim.height || pos.y < 0) {
      return;
    }
    
    var scalar = Encoder.coordToScalar(pos, this.dim);

    // if other elements occupy the same pos, update collisions with the
    // current element 
    if (this.world[scalar]) {
      _.each(this.world[scalar], function (e) {
        var key;
        if (e.id() < element.id()) key = e.id() + element.id();
        else key = element.id() + e.id();

        this.collisions[key] = [e, element];
      }, this);
      this.world[scalar].push(element);
    }
    else this.world[scalar] = [element];
  };


  return CollisionFrame;
});
