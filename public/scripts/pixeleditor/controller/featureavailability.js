define(['underscore'], function (_) {
  var isiOS =  _.indexOf(['iPad', 'iPhone', 'iPod'], navigator.platform) >= 0;
  var featuresAvailble = Object.create(null);
  featuresAvailble.load = !isiOS;
  featuresAvailble.saveJSON = !isiOS;

  // Feature availability maps feature names to whether feature is available on
  // the current platform and in the current context.
  var FeatureAvailability = Object.create(null);


  // Argument: Feature name string.
  // Returns Whether a feature is available.
  FeatureAvailability.hasFeature = function (featureName) {
    return featuresAvailble[featureName] !== undefined ?
        featuresAvailble[featureName] :
        true;
  };

  return FeatureAvailability;
});
