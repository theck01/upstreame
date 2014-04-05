define(['underscore'], function (_) {
  
  // Frame is a moveable window into the game world
  //
  // Arguments:
  //   dimensions: object with 'width' and 'height' fields
  //   origin: object with 'x' and 'y' fields
  var Frame = function (dimensions, origin) {
    this._dim = _.clone(dimensions);
    this._origin = _.clone(origin);
  };


  // bounds returns the bounds of the frame in the game world
  //
  // Returns an object with 'xmin', 'xmax', 'ymin', 'ymax' fields
  Frame.prototype.bounds = function () {
    return { xmin: this._origin.x, ymin: this._origin.y,
             xmax: this._origin.x + this._dim.width,
             ymax: this._origin.y + this._dim.height };
  };


  // center returns the center of the frame in the game world
  Frame.prototype.center = function () {
    return { x: Math.floor(this._origin.x + this._dim.width/2),
             y: Math.floor(this._origin.y + this._dim.height/2) };
  };


  // contains checks to see whether an element is contained the frame
  // 
  // Arguments:
  //   element: any element instance
  // Returns:
  //   A boolean
  Frame.prototype.contains = function (element) {
    return !!_.find(element.pixels(), this.containsCoord, this);
  };


  // containsCoord checks to see whether an x,y coordinate is within the frame
  //
  // Arguments:
  //   coord: object with 'x' and 'y' fields
  // Returns:
  //   A boolean
  Frame.prototype.containsCoord = function (coord) {
    var x = coord.x - this._origin.x;
    var y = coord.y - this._origin.y;
    return (x >= 0 && x < this._dim.width && y >=0 && y < this._dim.height);
  };


  // getOrigin returns the frames dimensions
  //
  // Returns:
  //   object with 'width' and 'height' fields
  Frame.prototype.getDimensions = function () {
    return _.clone(this._dim);
  };


  // getOrigin returns the frames origin
  //
  // Returns:
  //   object with x and y fields
  Frame.prototype.getOrigin = function () {
    return _.clone(this._origin);
  };


  // move shifts the frame by an offset or to an absolute location
  //
  // Arguments:
  //   coord: object with 'x' and 'y' fields
  //   method: Optional, either 'offset' (default) or 'absolute'
  Frame.prototype.move = function (coord, method) {
    method = method || 'offset';

    if (method === 'absolute') {
      this._origin.x = Math.floor(coord.x);
      this._origin.y = Math.floor(coord.y);
    }
    else {
      this._origin.x = Math.floor(this._origin.x + coord.x);
      this._origin.y = Math.floor(this._origin.y + coord.y);
    }
  };


  // relativePosition transforms a coordinate to be based upon the internal
  // frame coordinate system.
  //
  // Arguments:
  //   coord: object with 'x' and 'y' fields.
  // Returns an object with 'x' and 'y' fields.
  Frame.prototype.relativePosition = function (coord) {
    return { x: coord.x - this._origin.x, y: coord.y - this._origin.y };
  };


  // resize sets the frames dimensions to the given value
  Frame.prototype.resize = function (dimensions) {
    this._dim = _.clone(dimensions);
  };


  return Frame;
});
