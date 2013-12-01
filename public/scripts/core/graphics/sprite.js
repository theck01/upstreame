define(['underscore'], function (_) {
  
  // Sprite object encapsulates a collection of pixel objects and provides
  // methods for drawing these pixels to a *Canvas with a given offset
  //
  // Constructor Arguments:
  //   pixels: An array of objects containing fields 'x', 'y', and 'color'
  //   center: An object with 'x' and 'y', the center of all pixels
  var Sprite = function (pixels, center) {
    this.pxls = pixels;
    
    // recenter sprite around the origin
    _.each(this.pxls, function (p) {
      p.x -= center.x;
      p.y -= center.y;
    });
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
