define(['underscore', 'util/priorityqueue'], function (_, PriorityQueue) {

  // Shared Variable
  var serial = 0;


  // FrameClock objects track time in discrete ticks and can schedule unique and
  // recurring events to be called after tick intervals
  var FrameClock = function () {
    this.ticks = 0;
    this.cancelled = [];
    this.events = new PriorityQueue(function (a, b) {
      if (a.tick <= b.tick) return true;
      return false;
    });
  };


  // schedule sets a callback function to be called every n ticks
  //
  // Arguments:
  //   callback: function to be called in the future, takes 0 arguments
  //   ticks: number of ticks (game loops) to wait between callback calls.
  //          A value of 1 means callback will be called each loop
  //
  // Returns:
  //   The integer id of the callback scheduled
  FrameClock.prototype.recurring = function (callback, ticks) {
    var id = serial++;
    var clock = this;

    // wrap give callback in a function that adds self to priority queue again
    var recurringCallback = function () {
      clock.events.push({ tick: ticks + clock.ticks, cb: recurringCallback,
                         id: id });
      callback();
    };

    this.events.push({ tick: ticks + clock.ticks, cb: recurringCallback,
                       id: id });

    return id;
  };


  // cancel removes the event with given id from the schedule queue, never to
  // be called again
  FrameClock.prototype.cancel = function (id) {
    this.events.filter(function (e) {
      return e.id !== id;
    });
    this.cancelled.push(id);
  };


  // schedule sets a callback function to be called n ticks from now
  //
  // Arguments:
  //   callback: function to be called in the future, takes 0 arguments
  //   ticks: number of ticks (game loops) to wait before calling callback
  //          A value of 1 means callback will be called on next tick
  //
  // Returns:
  //   The integer id of the callback scheduled
  FrameClock.prototype.schedule = function (callback, ticks) {
    var eventPair = { tick: ticks + this.ticks, cb: callback, id: serial++ };
    this.events.push(eventPair);
    return eventPair.id;
  };


  // advance the FrameClock by a single tick, calling any callbacks that whose
  // wait time has ended
  FrameClock.prototype.tick = function () {
    this.ticks++;
    var clock = this;

    var events = [];
    while(clock.events.peek() && clock.events.peek().tick <= clock.ticks) {
      events.push(clock.events.pop());
    }
    _.each(events, function (e) {
      var wasCancelled = _.find(clock.cancelled, function (id) {
        return id === e.id;
      });
      if (!wasCancelled) e.cb();
    });
  };


  return FrameClock;
});
