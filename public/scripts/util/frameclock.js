define(['underscore', 'util/priorityqueue'], function (_, PriorityQueue) {

  // Shared Variable
  var serial = 0;


  // FrameClock objects track time in discrete ticks and can schedule unique and
  // recurring events to be called after tick intervals
  var FrameClock = function () {
    this.ticks = 0;
    this.events = new PriorityQueue(function (a, b) {
      if (a.tick <= b.tick) return true;
      return false;
    });
  };


  // schedule sets a callback function to be called n ticks from now
  //
  // Arguments:
  //   callback: function to be called in the future, takes 0 arguments
  //   ticks: number of ticks (game loops) to wait before calling callback
  //
  // Returns:
  //   The integer id of the callback scheduled
  FrameClock.prototype.schedule = function (callback, ticks) {
    var eventPair = { tick: ticks + this.ticks, cb: callback, id: serial++ };
    this.events.push(eventPair);
    return eventPair.id;
  };


  // schedule sets a callback function to be called every n ticks
  //
  // Arguments:
  //   callback: function to be called in the future, takes 0 arguments
  //   ticks: number of ticks (game loops) to wait between callback calls
  //
  // Returns:
  //   The integer id of the callback scheduled
  FrameClock.prototype.recurring = function (callback, ticks) {
    var id = serial++;

    // wrap give callback in a function that adds self to priority queue again
    var recurringCallback = function () {
      this.events.push({ tick: ticks + this.ticks, cb: recurringCallback,
                         id: id });
      callback();
    };

    this.events.push({ tick: ticks + this.ticks, cb: recurringCallback,
                       id: id });

    return id;
  };


  // advance the FrameClock by a single tick, calling any callbacks that whose
  // wait time has ended
  FrameClock.prototype.tick = function () {
    var cbs = [];
    while(this.events.peek() && this.events.peek().tick <= this.ticks) {
      cbs.push(this.events.pop());
    }
    _.each(cbs, function (cb) { cb(); });
  };


  return FrameClock;
});
