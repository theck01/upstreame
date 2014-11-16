define(
    ['jquery', 'underscore', 'core/graphics/pixelcanvas'],
    function ($, _, PixelCanvas) {
  // ImageDataURIGenerator converts various forms of the sprite data model to
  // base64 encoded data uris for the underlying image.
  var ImageDataURIGenerator = Object.create(null);
  
  
  // exportModelToDataURI converts an exported sprite model into a base64
  // encoded image data uri, with optional image format.
  //
  // Arguments:
  //     exportedModel: Object with at least the following fields
  //         'pixels': array of objects with 'x', 'y' and 'color' fields.
  //         'dimensions': object with 'width' and 'height' fields.
  //         'backgroundColor': The background color to display the sprite on.
  //     pixelSize: The number of pixels that the width and height of a
  //         metapixel in the image should span.
  //     opt_fileType: Optional file type for the end image. Defaults to
  //         'image/png'.
  // Returns a base64 encoded image data URI
  ImageDataURIGenerator.exportedModelToDataURI = function (
      exportedModel, pixelSize, opt_fileType) {
    opt_fileType = opt_fileType || 'image/png';
    var $canvas = $('<canvas/>');
    var canvas = $canvas[0];
    
    // Size the canvas to perfectly fit the underlying image.
    canvas.width = exportedModel.dimensions.width * pixelSize;
    canvas.height = exportedModel.dimensions.height * pixelSize;

    var pixelCanvas = new PixelCanvas(
        exportedModel.dimensions, $canvas, exportedModel.backgroundColor,
        { width: canvas.width, height: canvas.height });
    _.each(exportedModel.pixels, function (p) {
      pixelCanvas.setPixel(p.x, p.y, p.color);
    });
    pixelCanvas.paint();

    return canvas.toDataURL(opt_fileType);
  };


  return ImageDataURIGenerator;
});
