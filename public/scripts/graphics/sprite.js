define(['underscore'], function (_) {
  
  // Sprite object encapsulates a collection of pixel objects and provides
  // methods for drawing these pixels to a *Canvas with a given offset
  //
  // Constructor Arguments:
  //   pixels: An array of objects containing fields 'x', 'y', and 'color'
  //   center: An object with 'x' and 'y', the center of all pixels
  var Sprite = function (pixels, center) {
    this.pixels = pixels;
    
    // recenter sprite around the origin
    _.each(this.pixels, function (p) {
      p.x -= center.x;
      p.y -= center.y;
    });
  };


  // paint draws the sprite to an instance of *Canvas relocated to have the
  // center specified.
  //
  // Arguments:
  //   *Canvas: An instance of either PixelCanvas or LayeredCanvas
  //   center: An object with 'x' and 'y', the center of all pixels
  Sprite.prototype.paint = function (canvas, center, layer) {
    _.each(this.pixels, function (p) {
      canvas.setPixel(p.x + center.x, p.y + center.y, p.color, layer);
    });
  };

  return Sprite;
});
