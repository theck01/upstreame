define([], function () {

  var IdentityConverter = Object.create(null);


  // fromCommonModelFormat returns a custom model format given a the common
  // model format
  //
  // Arguments:
  //   model: object with 'elements', 'dimensions', 'defaultElement', and
  //          'currentElement' fields
  // Returns object with 'elements', 'dimensions', 'defaultElement', and
  // 'currentElement' fields
  IdentityConverter.fromCommonModelFormat = function (model) {
    return model;
  };


  // toCommonModelFormat returns a common model given a the custom mode format
  //
  // Arguments:
  //   customModel: object with 'elements', 'dimensions', 'defaultElement', and
  //                'currentElement' fields
  // Returns object with 'elements', 'dimensions', 'defaultElement', and
  // 'currentElement' fields
  IdentityConverter.toCommonModelFormat = function (customModel) {
    return customModel;
  };


  return IdentityConverter;
});
