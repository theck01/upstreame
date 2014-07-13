var _ = require('underscore');
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
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});


var Value = requirejs('pixeleditor/actions/value');

describe('Value', function () {
  var value = null;

  beforeEach(function () {
    value = new Value({ one: 1, two: 2 }, function (newValue) {
      return typeof newValue === 'number' ? null : newValue;
    });
  });

  describe('#getValue', function () {
    it('should return the current value.', function () {
      _.isEqual(value.getValue(), { one: 1, two: 2 }).should.be.true;
    });
  });


  describe('#setValue', function () {
    it('should update the value.', function () {
      value.setValue('new value');
      _.isEqual(value.getValue(), 'new value').should.be.true;
    });


    it('should not update the value with invalid arguments.', function () {
      value.setValue(3);
      _.isEqual(value.getValue(), 3).should.be.false;
      _.isEqual(value.getValue(), { one: 1, two: 2 }).should.be.true;
    });


    it('should call value change handlers when the value changes.',
        function () {
      var spyHandler = sinon.spy();
      var spyHandler2 = sinon.spy();
      value.addValueChangeHandler(spyHandler);
      value.addValueChangeHandler(spyHandler2);

      value.setValue('new value');

      spyHandler.calledOnce.should.be.true;
      spyHandler.calledWith('new value');

      spyHandler2.calledOnce.should.be.true;
      spyHandler2.calledWith('new value');
    });


    it('should not call value change handlers when the value is not changed.',
        function () {
      var spyHandler = sinon.spy();
      value.addValueChangeHandler(spyHandler);
      value.setValue({ one: 1, two: 2 });
      spyHandler.called.should.be.false;
    });


    it('should not call value change handlers that have been removed.',
        function () {
      var spyHandler = sinon.spy();
      value.addValueChangeHandler(spyHandler);
      value.removeValueChangeHandler(spyHandler);
      value.setValue('new value');
      spyHandler.called.should.be.false;
    });
  });


  describe('#setValidator', function () {
    it('should use new validation function for later #setValue calls',
        function () {
      value.setValidator(function (newValue) {
        return typeof newValue === 'number' ? newValue : null;
      });

      value.setValue(3);
      value.getValue().should.be.eql(3);

      value.setValue('new value');
      value.getValue().should.be.eql(3);
    });
  });
});
