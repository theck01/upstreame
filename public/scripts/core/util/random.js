define([], function () {

  // Prime number ~1,000,000
  var _RANDOM_NUMBER_COUNT = 1299827;

  var _index = 0;

  // Initialize the random number cache
  var _randomCache = [];
  for (var i = 0; i < _RANDOM_NUMBER_COUNT; i++) {
    _randomCache.push(Math.random());
  }


  // Random provides access to the random number cache as well as helper
  // methods for accessing the numbers in various formats.
  var Random = Object.create(null);


  // Return a random number between [0, 1)
  Random.next = function () {
    return _randomCache[_index++];
  };


  // Return a random float between [min, max)
  Random.withinRange = function (min, max) {
    return _randomCache[_index++] * (max - min) + min;
  };


  // Return a random integer between [min, max]
  Random.integerWithinRange = function (min, max) {
    return Math.floor(_randomCache[_index++] * (max - min) + min + 0.5);
  };


  // Return whether an occurence with given probability should happen or not.
  Random.probability = function (probability) {
    return _randomCache[_index++] < probability;
  };


  return Random;
});
