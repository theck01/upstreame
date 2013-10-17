define([], function () {

  var Encoder = {};


  // coordToScalar returns a scalar encoding of an (x,y) coordinate into a 
  // single scalar value
  //
  // Arguments:
  //   coord: An object with integer 'x' and 'y' fields
  //   dim: An object with integer 'width' and 'height' fields
  //
  // Return:
  //   A scalar value
  Encoder.coordToScalar = function (coord, dim) {
    return coord.x * dim.height + coord.y;
  };


  // scalarToCoord returns an (x,y) coordinate into generated from an encoded
  // scalar value
  //
  // Arguments:
  //   scalar: An object with integer 'x' and 'y' fields
  //   dim: An object with integer 'width' and 'height' fields
  //
  // Return:
  //   A coordinate object, with 'x' and 'y' fields:
  Encoder.scalarToCoord = function (scalar, dim) {
    return { x: Math.floor(scalar/dim.height), y: scalar%dim.height };
  };

  return Encoder;
});
