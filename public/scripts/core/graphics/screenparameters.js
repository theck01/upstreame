define([], function () {
  var ScreenParameters = Object.create(null);


  // create measures generates the pixel sizings and overall offset for a grid
  // with the given dimensions in the given available space.
  // Arguments:
  //   dimensions: object with 'width' and 'height' fields.
  //   availableSpace: object with 'width' and 'height' fields.
  //
  // Return fields:
  //   pixelSize: meta-pixel width and height in screen pixels
  //   xoffset: x offset in screen pixels of the left most pixels from the
  //            left edge of the canvas
  //   yoffset: yoffset in screen pixels of the top most pixels from the
  //            top most edge of the canvas
  ScreenParameters.create = function (metaPixelDimensions, availableSpace) {
    var screenParams = Object.create(null);

    var xfactor = Math.floor(availableSpace.width/metaPixelDimensions.width);
    var yfactor = Math.floor(availableSpace.height/metaPixelDimensions.height);

    // meta-pixel dimensions determined by the smallest screen pixel to 
    // meta-pixel ratio, so that all pixels will fit on screen
    screenParams.pixelSize = xfactor < yfactor ? xfactor : yfactor;

    // compute offsets using computed pixelSize and number of pixels in each
    // dimension so that the canvas is centered
    screenParams.xoffset = Math.floor(
        (availableSpace.width -
         screenParams.pixelSize * metaPixelDimensions.width)/2);
    screenParams.yoffset = Math.floor(
        (availableSpace.height -
         screenParams.pixelSize * metaPixelDimensions.height)/2);

    return screenParams;
  };


  return ScreenParameters;
});
