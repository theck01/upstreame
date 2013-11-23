var assert = require('assert');
var requirejs = require('requirejs');
var should = require('should');
var _ = require('underscore');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});
 
var FrameClock = requirejs('util/frameclock');

describe('FrameClock', function () {
  var fc;

  beforeEach(function () {
    fc = new FrameClock();
  });

  describe('FrameClock#cancel', function () {
    it('should stop an event from being run in the future', function (done) {
      var called = false;
      var eventID = fc.schedule(function () {
        called = true;
      }, 3);

      fc.tick();
      fc.cancel(eventID);
      for (var i=0; i<3; i++) fc.tick();

      called.should.be.false;
      done();
    });
  });

  describe('FrameClock#schedule', function () {
    it('should run a function n ticks in the future', function (done) {
      var called = false;
      fc.schedule(function () {
        called = true;
      }, 3);

      for (var i=0; i<3; i++) {
        called.should.be.false;
        fc.tick();
      }

      called.should.be.true;
      done();
    });
  });

  describe('FrameClock#recurring', function () {
    it('should run a function every n ticks in the future', function (done) {
      var callCount = 0;
      fc.recurring(function () {
        callCount++;
      }, 3);

      for (var i=0; i<10; i++) {
        callCount.should.eql(Math.floor(i/3));
        fc.tick();
      }

      done();
    });
  });
});
