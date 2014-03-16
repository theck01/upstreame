var assert = require('assert');
var requirejs = require('requirejs');
var should = require('should');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var Color = requirejs('core/graphics/color');

describe('Color', function () {
  context('when sanitize is provided reasonably formed color strings',
    function () {
      it('should sanitize those strings into form "#RRGGBB"', function () {
        Color.sanitize('#123456').should.eql('#123456');
        Color.sanitize('123456').should.eql('#123456');
        Color.sanitize('#123').should.eql('#112233');
        Color.sanitize('123').should.eql('#112233');
      });
    }
  );

  context('when sanitize is provided poorly formed color strings', function () {
    it('should return a default color "#FFFFFF"', function () {
      Color.sanitize('').should.eql('#FFFFFF');
      Color.sanitize('#00').should.eql('#FFFFFF');
      Color.sanitize('#12345G').should.eql('#FFFFFF');
      Color.sanitize('#1234567').should.eql('#FFFFFF');
    });
  });

  it('should shade colors with the appropriate offset', function () {
    Color.shade('#111111', -1).should.eql('#101010');
    Color.shade('#A0A0A0', 10).should.eql('#AAAAAA');
  });
});
