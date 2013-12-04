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

var EventHub = requirejs('core/util/eventhub');

describe('EventHub', function () {
  before(function (done) {
    EventHub.subscribe('nevercalled', function () {
      assert(false, '"nevercalled" event should not have been triggered');
    });

    done();
  });

  it('should call registered functions when event is triggered',
    function (done) {
      var expectedData = { a: 1, b: 2 };
      var callbacks = 0;

      EventHub.subscribe('triggerable', function (data) {
        data.should.eql(expectedData);
        if (++callbacks == 2) {
          EventHub.unsubscribe('triggerable'); 
          done();
        }
      });

      EventHub.subscribe('triggerable', function (data) {
        data.should.eql(expectedData);
        if (++callbacks == 2) {
          EventHub.unsubscribe('triggerable'); 
          done();
        }
      });

      EventHub.trigger('triggerable', expectedData);
    }
  );

  it('should not call unsubscribed functions when event is triggered',
    function (done) {
      var unsubscribedCallback = function () {
        assert(false, '"unsubscribed" event callback should not be called');
      };

      EventHub.subscribe('unsubscribed', unsubscribedCallback);
      EventHub.unsubscribe('unsubscribed', unsubscribedCallback);
      EventHub.trigger('unsubscribed');

      // give 'unsubscribed' event time to fully trigger
      setTimeout(done, 100);
    }
  );
});
