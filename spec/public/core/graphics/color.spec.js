var requirejs = require('requirejs');
var should = require('should');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

function assertColorObjsEqual (colorObj1, colorObj2) {
  colorObj1.red.should.eql(colorObj2.red);
  colorObj1.green.should.eql(colorObj2.green);
  colorObj1.blue.should.eql(colorObj2.blue);
}

var Color = requirejs('core/graphics/color');

describe('Color', function () {
  context('when functions are provided reasonably formed color strings',
    function () {
      it('sanitize should return equivalent strings in "#RRGGBB" form',
        function () {
          Color.sanitize('#123456').should.eql('#123456');
          Color.sanitize('123456').should.eql('#123456');
          Color.sanitize('#123').should.eql('#112233');
          Color.sanitize('123').should.eql('#112233');
        }
      );

      it('toObject should return an equivalent object split into components',
        function () {
          var expectedObj = { red: 255, green: 17, blue: 34 };
          assertColorObjsEqual(Color.toObject('#FF1122'), expectedObj);
          assertColorObjsEqual(Color.toObject('fF1122'), expectedObj);
          assertColorObjsEqual(Color.toObject('#f12'), expectedObj);
          assertColorObjsEqual(Color.toObject('F12'), expectedObj);
        }
      );

      it('shade should return a color string with the appropriate offset',
        function () {
          Color.shade('#111111', -1).should.eql('#101010');
          Color.shade('#A0A0A0', 10).should.eql('#AAAAAA');
        }
      );
    }
  );

  context('when functions are provided poorly formed color strings',
    function () {
      it('sanitize should return a default color "#FFFFFF"', function () {
        Color.sanitize('').should.eql('#FFFFFF');
        Color.sanitize('#00').should.eql('#FFFFFF');
        Color.sanitize('#12345G').should.eql('#FFFFFF');
        Color.sanitize('#1234567').should.eql('#FFFFFF');
      });

      it('toObject should return an object equivalent to "#FFFFFF"',
        function () {
          var expectedObj = { red: 255, green: 255, blue: 255 };
          assertColorObjsEqual(Color.toObject(''), expectedObj);
          assertColorObjsEqual(Color.toObject('F1122'), expectedObj);
          assertColorObjsEqual(Color.toObject('#fg1213'), expectedObj);
          assertColorObjsEqual(Color.toObject('#FF12012'), expectedObj);
        }
      );
    }
  );

  context('when functions are passed properly formatted color objects',
    function () {
      it('toString should return an equivalent "#RRGGBB" color string',
        function () {
          Color.toString({ red: 255, blue: 34, green: 17 }).should
            .eql('#FF1122');
          Color.toString({ red: 1024, blue: -29485, green: 17 }).should
            .eql('#FF1100');
        }
      );
    }
  );

  context('when functions are passed color objects missing fields',
    function () {
      it('toString should return an equivalent "#RRGGBB" color string while' +
         'filling missing fields with a default value', function () {
          Color.toString({ red: 255, green: 17 }).should
            .eql('#FF11FF');
        }
      );
    }
  );
});
