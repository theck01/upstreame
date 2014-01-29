define(['underscore'], function (_) {
  
  // Frame is a moveable window into the game world
  //
  // Arguments:
  //   dimensions: object with 'width' and 'height' fields
  //   origin: object with 'x' and 'y' fields
  var Frame = function (dimensions, origin) {
    this.dim = _.clone(dimensions);
    this.origin = _.clone(origin);
  };


  // bounds returns the bounds of the frame in the game world
  //
  // Returns an object with 'xmin', 'xmax', 'ymin', 'ymax' fields
  Frame.prototype.bounds = function () {
    return { xmin: this.origin.x, ymin: this.origin.y,
             xmax: this.origin.x + this.dim.width,
             ymax: this.origin.y + this.dim.height };
  };


  // center returns the center of the frame in the game world
  Frame.prototype.center = function () {
    return { x: Math.floor(this.origin.x + this.dimension.width/2),
             y: Math.floor(this.origin.y + this.dimension.height/2) };
  };


  // contains checks to see whether an element is contained the frame
  // 
  // Arguments:
  //   element: any element instance
  Frame.prototype.contains = function (element) {
    return !!_.find(element.pixels(), function (p) {
      var x = p.x - this.origin.x;
      var y = p.y - this.origin.y;
      return (x >= 0 && x < this.dim.width && y >=0 && y < this.dim.height);
    }, this);
  };


  // move shifts the frame by an offset or to an absolute location
  //
  // Arguments:
  //   coord: object with 'x' and 'y' fields
  //   method: Optional, either 'offset' (default) or 'absolute'
  Frame.prototype.move = function (coord, method) {
    method = method || 'offset';

    if (method === 'absolute') {
      this.origin.x = Math.floor(coord.x);
      this.origin.y = Math.floor(coord.y);
    }
    else {
      this.origin.x = Math.floor(this.origin.x + coord.x);
      this.origin.y = Math.floor(this.origin.y + coord.y);
    }
  };


  return Frame;
});
