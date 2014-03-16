var assert = require('assert');
var requirejs = require('requirejs');
var sinon = require('sinon');

requirejs.config({
  baseUrl: 'public/scripts',
  nodeRequire: require,
  paths: {
    underscore: 'bower_components/underscore-amd/underscore-min'
  }
});

var Base = requirejs('core/actors/base');
var EventHub = requirejs('core/controller/eventhub');

describe('Base', function () {
  var newActorSpy;
  var destroyActorSpy;
  var moveActorSpy;

  var opts = {
    group: 'Test',
    sprite: null,
    center: { x: 0, y: 0 },
    layer: 0,
    noncollidables: ['Test']
  };

  beforeEach(function () {
    newActorSpy = sinon.spy();
    destroyActorSpy = sinon.spy();
    moveActorSpy = sinon.spy();

    EventHub.subscribe('actor.new', newActorSpy);
    EventHub.subscribe('actor.destroy', destroyActorSpy);
    EventHub.subscribe('actor.move', moveActorSpy);
  });


  it('should trigger event "actor.new" on creation', function () {
    var actor = new Base(opts);
    assert(newActorSpy.calledOnce);
    assert(newActorSpy.calledWith({
      actor: actor
    }));
  });


  it('should trigger event "actor.destroy" on destruction', function () {
    var actor = new Base(opts);
    actor.destroy();
    assert(destroyActorSpy.calledOnce);
    assert(destroyActorSpy.calledWith({
      actor: actor
    }));
  });


  context('when the actor is moved to a new location', function () {
    it('should trigger event "actor.move" on location change', function () {
      var actor = new Base(opts);
      actor.move({ x: 1, y: 1 });
      assert(moveActorSpy.calledOnce);
      assert(moveActorSpy.calledWith({
        actor: actor,
        from: { x: 0, y: 0 },
        to: { x: 1, y: 1 }
      }));

      actor.move({ x: 0, y: 0 }, 'absolute');
      assert(moveActorSpy.calledTwice);
      assert(moveActorSpy.calledWith({
        actor: actor,
        from: { x: 1, y: 1 },
        to: { x: 0, y: 0 }
      }));
    });
  });


  context('when the actor is moved to the same location', function () {
    it('should not trigger event "actor.move"', function () {
      var actor = new Base(opts);
      actor.move({ x: 0, y: 0 });
      actor.move({ x: 0, y: 0 }, 'absolute');

      assert(!moveActorSpy.called);
    });
  });


  it('should subscribe to "world.step" and trigger Base#_act on event',
    function () {
      var actor = new Base(opts);
      var stub = sinon.stub(actor, '_act');
      sinon.stub(actor, 'isDynamic', function () {
        return true;
      });

      EventHub.trigger('world.step');
      assert(stub.calledOnce);
      assert(stub.calledOn(actor));
    }
  );


  afterEach(function () {
    EventHub.unsubscribe('actor.new', newActorSpy);
    EventHub.unsubscribe('actor.destroy', destroyActorSpy);
    EventHub.unsubscribe('actor.move', moveActorSpy);
  });
});
