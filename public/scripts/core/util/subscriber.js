define(['underscore', 'core/controller/eventhub'], function (_, EventHub) {

  // Subscriber is a mixin for any object that subscribes to EventHub events
  // and can also be destroyed and needing to unsubscribe from those events.
  // Events enabled on construction
  var Subscriber = function () {
    this._eventsEnabled = true;
    this._subscriptions = [];
  };


  // enableEvents enables an instances subscriptions if currently disabled
  Subscriber.prototype.enableEvents = function () {
    if (!this._eventsEnabled) {
      _.each(this._subscriptions, function (s) {
        EventHub.subscribe(s.eventName, s.handler);
      });
    }

    this._eventsEnabled = true;
  };


  // disableEvents disables an instances subscriptions if currently enabled
  Subscriber.prototype.disableEvents = function () {
    if (this._eventsEnabled) {
      _.each(this._subscriptions, function (s) {
        EventHub.unsubscribe(s.eventName, s.handler);
      });
    }

    this._eventsEnabled = false;
  };
  

  // destroy removes all event subscriptions associated with subscriber instance
  Subscriber.prototype.destroy = function () {
    this.disableEvents();
    this._subscriptions = [];
  };


  // register a event handler to an event
  //
  // Arguments:
  //   eventName: event to register handler for
  //   handler: function that takes a single object parameter called when event
  //            is triggered
  Subscriber.prototype.register = function (eventName, handler) {
    this._subscriptions.push({ eventName: eventName, handler: handler });
    if (this._eventsEnabled) EventHub.subscribe(eventName, handler);
  };


  // unregister event handler(s) from and event
  //
  // Arguments:
  //   eventName: event to remove handler for
  //   handler: Optional, function to remove. If undefined all handlers are
  //            removed
  Subscriber.prototype.unregister = function (eventName, handler) {
    this._subscriptions = _.reduce(this._subscriptions, function (memo, s) {
      if (s.eventName === eventName &&
          (handler === s.handler || handler === undefined)) {
        if (this._eventsEnabled) EventHub.unsubscribe(s.eventName, s.handler);
      }
      else memo.push(s);

      return memo;
    }, [], this);
  };


  return Subscriber;
});
