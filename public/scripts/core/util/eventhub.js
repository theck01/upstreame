define(['underscore'], function (_) {

  var detatch = setImmediate || function (cb) {
    setTimeout(cb, 0);
  };
  
  // EventHub singleton provides interface for triggering and subscribing to
  // events
  var EventHub = Object.create(null);
  EventHub.eventMap = Object.create(null);


  // subscribe registers a callback to a event
  //
  // Arguments:
  //   eventName: Event name string
  //   cb: callback taking up to one argument, an object with fields dependent
  //       upon event type
  EventHub.subscribe = function (eventName, cb) {
    this.eventMap[eventName] = this.eventMap[eventName] || [];
    this.eventMap[eventName].push(cb);
  };


  // trigger initiates an event, calling all registered callbacks
  //
  // Arguments:
  //   eventName: Event name string
  //   params: Optional, object to be passed to registered callbacks
  EventHub.trigger = function (eventName, params) {
    _.each(this.eventMap[eventName] || [], function (cb) {
      detatch(function () {
        cb(params);
      });
    });
  };


  // unsubscribe unregisters function(s) from an event
  //
  // Arguments:
  //   eventName: Event name string
  //   f: Optional, the function to unregister. If undefined all subscribers are
  //      removed from the event
  EventHub.unsubscribe = function (eventName, f) {
    if (!f) {
      this.eventMap[eventName] = [];
      return;
    }

    this.eventMap[eventName] = _.filter(this.eventMap[eventName],
      function (cb) {
        return cb !== f;
      }
    );
  };

  return EventHub;
});
