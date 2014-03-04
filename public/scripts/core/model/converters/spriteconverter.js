define(["core/graphics/sprite"], function (Sprite) {

  var SpriteConverter = Object.create(null);


  // fromCommonModelFormat returns a custom model format given a the common
  // model format
  //
  // Arguments:
  //   model: object with 'elements', 'dimensions', 'defaultElement', and
  //          'currentElement' fields
  // Returns object with 'pixels', 'dimensions', 'backgroundColor', and
  // 'currentColor' fields
  SpriteConverter.fromCommonModelFormat = function (model) {
    return {
      pixels: model.elements,
      dimensions: model.dimensions,
      backgroundColor: model.defaultElement.color,
      currentColor: model.currentElement.color
    };
  };


  // toCommonModelFormat returns a common model given a the custom mode format
  //
  // Arguments:
  //   customModel: object with 'pixels', 'dimensions', 'backgroundColor', and
  //                'currentColor' fields
  // Returns an object with 'elements', 'dimensions', 'defaultElement', and
  // 'currentElement' fields
  SpriteConverter.toCommonModelFormat = function (customModel) {
    var model = {
      elements: customModel.pixels,
      dimensions: customModel.dimensions,
      defaultElement: { color: customModel.backgroundColor },
      currentElement: { color: customModel.currentColor }
    };

    model.defaultElement = model.defaultElement || { color: "#FFFFFF" };
    model.currentElement = model.currentElement || { color: "#000000" };

    if (!model.dimensions) {
      var sprite = new Sprite(customModel.pixels);
      var bounds = sprite.bounds();
      model.dimensions = { width: bounds.xmax, height: bounds.ymax };
    }

    return model;
  };


  return SpriteConverter;
});
