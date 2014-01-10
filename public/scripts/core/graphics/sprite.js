define(['underscore', 'core/util/encoder'], function (_, Encoder) {
  
  // Sprite object encapsulates a collection of pixel objects and provides
  // methods for drawing these pixels to a *Canvas with a given offset
  //
  // Constructor Arguments:
  //   pixels: An array of objects containing fields 'x', 'y', and 'color'
  //   center: An object with 'x' and 'y', the center of all pixels
  var Sprite = function (pixels) {
    var bounds = {
      xmin: Infinity,
      xmax: -Infinity,
      ymin: Infinity,
      ymax: -Infinity
    };
    var sums = { x: 0, y: 0 };

    // find bounds on sprite and center of sprite
    _.each(pixels, function (p) {
      if (p.x < bounds.xmin) bounds.xmin = p.x;
      if (p.y < bounds.ymin) bounds.ymin = p.y;
      if (p.x > bounds.xmax) bounds.xmax = p.x;
      if (p.y > bounds.ymax) bounds.ymax = p.y;
      sums.x += p.x;
      sums.y += p.y;
    });

    var center = { x: Math.round(sums.x/pixels.length),
                   y: Math.round(sums.y/pixels.length) };
    var dim = { width: bounds.xmax - bounds.xmin + 1,
                height: bounds.ymax - bounds.ymin + 1 };

    // remove pixel duplication and recenter sprite to 0,0
    var pixelMap = Object.create(null);
    _.each(pixels, function (p) {
      var scalar = Encoder.coordToScalar({ x: p.x - bounds.xmin,
                                           y: p.y - bounds.ymin }, dim);
      pixelMap[scalar] = { x: p.x - center.x, y: p.y - center.y,
                           color: p.color };
    });

    this.pxls = _.values(pixelMap);
  };


  // paintOn draws the sprite to an instance of *Canvas relocated to have the
  // center specified.
  //
  // Arguments:
  //   canvas: An instance of either PixelCanvas or LayeredCanvas
  //   center: An object with 'x' and 'y', the center of all pixels
  Sprite.prototype.paintOn = function (canvas, center, layer) {
    _.each(this.pxls, function (p) {
      canvas.setPixel(p.x + center.x, p.y + center.y, p.color, layer);
    });
  };


  // pixels returns an array of objects with 'x' 'y' field representing the
  // pixel locations of the sprite shifted to have given center
  //
  // Arguments:
  //   center: an object with 'x' and 'y' integer fields
  //
  // Returns:
  //   An array of objects with 'x' and 'y' fields
  Sprite.prototype.pixels = function (center) {
    return _.reduce(this.pxls, function (memo, p) {
      memo.push({ x: p.x + center.x, y: p.y + center.y });
      return memo;
    }, []);
  };


  return Sprite;
});
