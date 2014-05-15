var assert = require('assert');
var requirejs = require('requirejs');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var Random = requirejs('core/util/random');

describe('Random', function () {
  it('should retrieve a random float between [0, 1) on next', function () {
    for (var i=0; i < 100; i++) {
      var random = Random.next();
      assert(random >= 0 && random < 1);
    }
  });
  
  it('should retrieve random float between [min, max) on withinRange',
    function () {
      var min = 0;
      var max = 120;
      var random = null;
      for (var i=0; i < 100; i++) {
        random = Random.withinRange(min, max);
        assert(random >= min && random < max);
      }

      min = -1024.23;
      max = 1004958.248;
      for (i=0; i < 100; i++) {
        random = Random.withinRange(min, max);
        assert(random >= min && random < max);
      }
    }
  );
  
  it('should retrieve random integer between [min, max] on integerWithinRange',
    function () {
      var min = 0;
      var max = 120;
      var random = null;
      for (var i=0; i < 100; i++) {
        random = Random.integerWithinRange(min, max);
        assert(random >= min && random <= max);
        assert(Math.floor(random) === random);
      }

      min = -1024;
      max = 1004958;
      for (i=0; i < 100; i++) {
        random = Random.integerWithinRange(min, max);
        assert(random >= min && random < max);
        assert(Math.floor(random) === random);
      }
    }
  );
  
  it('should retrieve boolean on whether probability occurs on probability',
    function () {
      var passed = false;
      var failed = false;
      for (var i=0; i < 100; i++) {
        passed = passed || Random.probability(0.5);
        failed = failed || !Random.probability(0.5);
      }

      assert(passed && failed);
    }
  );
});
