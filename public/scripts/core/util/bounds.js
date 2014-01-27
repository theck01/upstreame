define(['underscore'], function (_) {

  // Bounds object is a collection of functions that operate on primitive
  // objects with 'xmin', 'xmax', 'ymin', 'ymax' fields
  var Bounds = Object.create(null);


  // contains returns true is bounds b contains point p
  //
  // Arguments:
  //   b: object with 'xmin', 'xmax', 'ymin', and 'ymax' fields
  //   p: object with 'x' and 'y' fields
  Bounds.contains = function (b, p) {
    return p.x >= b.xmin && p.x <= b.xmax && p.y >= b.ymin && p.y <= b.ymax;
  };


  // edges returns the edges of the bound object
  //
  // Arguments:
  //   b: object with 'xmin', 'xmax', 'ymin', and 'ymax' fields
  // Returns array of array pairs, each array pair containing two object with
  // 'x' and 'y' fields
  Bounds.edges = function (b) {
    // return edges in order: left, right, top, bottom
    return [
      [ { x: b.xmin, y: b.ymin }, { x: b.xmin, y: b.ymax } ],
      [ { x: b.xmax, y: b.ymin }, { x: b.xmax, y: b.ymax } ],
      [ { x: b.xmin, y: b.ymin }, { x: b.xmax, y: b.ymin } ],
      [ { x: b.xmin, y: b.ymax }, { x: b.xmax, y: b.ymax } ]
    ];
  };


  // intesect returns true if two bounds intersect each other, false if not
  //
  // Arguments:
  //   a: object with 'xmin', 'xmax', 'ymin', and 'ymax' fields
  //   b: object with 'xmin', 'xmax', 'ymin', and 'ymax' fields
  // Returns a boolean
  Bounds.intersect = function (a, b) {
    // check for case where a bounding object contains the other
    if (Bounds.contains(b, { x: a.xmin, y: a.ymin }) ||
        Bounds.contains(a, { x: b.xmin, y: b.ymin })) {
      return true;
    }

    // check all edges for intersections
    var aEdges = Bounds.edges(a);
    var bEdges = Bounds.edges(b);

    // dependent upon the order of the edges returned from edges function
    // all possible combinations of [vertical edge, horizontal edge] with one
    // edge from a and b
    var edgePairs = [ [aEdges[0],bEdges[2]], [aEdges[0],bEdges[3]],
                      [aEdges[1],bEdges[2]], [aEdges[1],bEdges[3]],
                      [bEdges[0],aEdges[2]], [bEdges[0],aEdges[3]],
                      [bEdges[1],aEdges[2]], [bEdges[1],aEdges[3]] ];

    return !!_.find(edgePairs, function (ep) {
      var v = ep[0];
      var h = ep[1];

      return v[0].x >= h[0].x && v[0].x <= h[1].x && v[0].y <= h[0].y &&
             v[1].y >= h[0].y;
    });
  };


  return Bounds;
});
