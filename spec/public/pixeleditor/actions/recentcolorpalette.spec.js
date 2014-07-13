var requirejs = require('requirejs');
var should = require('should');
var sinon = require('sinon');


requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  packages: [{
    location: '../../bower_components/domkit/domkit',
    name: 'domkit',
    main: 'domkit'
  }],
});


var RecentColorPalette = requirejs('pixeleditor/actions/recentcolorpalette');

describe('RecentColorPalette', function () {
  var colorPalette = null;
  var colorPaletteSize = 5;

  beforeEach(function () {
    colorPalette = new RecentColorPalette(colorPaletteSize);
    colorPalette.colorUsed('#FFFFFF');
    colorPalette.colorUsed('#000000');
    colorPalette.colorUsed('#FF00FF');
    colorPalette.colorUsed('#00FFFF');
  });

  describe('#getColorPalette', function () {
    it('should return the ordered set of currently used colors.', function () {
      var colors = colorPalette.getPalette();
      colors[0].should.eql('#00FFFF');
      colors[1].should.eql('#FF00FF');
      colors[2].should.eql('#000000');
      colors[3].should.eql('#FFFFFF');
    });
  });


  describe('#colorUsed', function () {
    it('should add a new color to the palette.', function () {
      colorPalette.colorUsed('#FFFF00');
      var colors = colorPalette.getPalette();
      colors.length.should.eql(5);
      colors[0].should.eql('#FFFF00');
    });

    
    it('should not add more than the maximum colors to the palette.',
        function () {
      colorPalette.colorUsed('#FFFF00');
      colorPalette.colorUsed('#777777');

      var colors = colorPalette.getPalette();
      colors.length.should.eql(5);
      colors[0].should.eql('#777777');
      colors[1].should.eql('#FFFF00');
      colors[2].should.eql('#00FFFF');
      colors[3].should.eql('#FF00FF');
      colors[4].should.eql('#000000');
    });


    it('should not add a malformed color to the palette.', function () {
      colorPalette.colorUsed('#FFF00');
      var colors = colorPalette.getPalette();
      colors.length.should.eql(4);
    });


    it('should not add duplicate colors to the palette.', function () {
      colorPalette.colorUsed('#000000');
      var colors = colorPalette.getPalette();
      colors.length.should.eql(4);
      colors[0].should.eql('#000000');
      colors[1].should.eql('#00FFFF');
      colors[2].should.eql('#FF00FF');
      colors[3].should.eql('#FFFFFF');
    });


    it('should call palette change handlers when palette is added to changes.',
        function () {
      var spyHandler = sinon.spy();
      colorPalette.addPaletteChangeHandler(spyHandler);

      colorPalette.colorUsed('#FFFF00');

      spyHandler.calledOnce.should.be.true;
      spyHandler.calledWith(
          ['#FFFF00', '#00FFFF', '#FF00FF', '#000000', '#FFFFFF']);
    });


    it('should call palette change handlers when palette is reordered.',
        function () {
      var spyHandler = sinon.spy();
      colorPalette.addPaletteChangeHandler(spyHandler);

      colorPalette.colorUsed('#000000');

      spyHandler.calledOnce.should.be.true;
      spyHandler.calledWith(
          ['#000000', '#00FFFF', '#FF00FF', '#FFFFFF']);
    });


    it('should not call palette change handlers when palette is not changed.',
        function () {
      var spyHandler = sinon.spy();
      colorPalette.addPaletteChangeHandler(spyHandler);
      colorPalette.colorUsed('#0000');
      colorPalette.colorUsed('#00FFFF');
      spyHandler.called.should.be.false;
    });
  });
});
