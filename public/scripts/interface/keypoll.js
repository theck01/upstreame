define(['jquery'], function ($) {

  // KeyPoll object can be bound to a dom element, and listens for key events
  // related to that element. States of any key can be queried, a key is
  // currently pressed if polling returns true, if not polling returns false.
  var KeyPoll = {
    keys: Object.create(null)
  };


  // Bind an instance of KeyPoll to the domID specified.
  //
  // Arguments:
  //   domID: CSS style selector used to specify which element to bind the
  //          key listening events for this instance of KeyPoll.
  //          Default: window
  KeyPoll.prototype.bind = function (domID) {
    var keypoll = this;

    if (!domID) domID = window;

    $(domID).keyup(function (e) {
      keypoll.clear(e.which);
    });

    $(domID).keydown(function (e) {
      keypoll.set(e.which);
    });
  };


  // Clear key with keycode from storage, indicating that it is no longer
  // pressed
  //
  // Arguments:
  //   keycode: Code identifiying the key to clear
  KeyPoll.prototype.clear = function (keycode) {
    this.keys[keycode] = false;
  };


  // Poll key with keycode to get pressed state
  // pressed
  //
  // Arguments:
  //   keycode: Code identifiying the key to poll
  // Returns:
  //   Boolean, true if key is pressed, false if not
  KeyPoll.prototype.poll = function (keycode) {
    return !!this.keys[keycode];
  };


  // Set key with keycode in storage, indicating that it is currently pressed
  //
  // Arguments:
  //   keycode: Code identifiying the key to set
  KeyPoll.prototype.set = function (keycode) {
    this.keys[keycode] = true;
  };

  
  return KeyPoll;
});
