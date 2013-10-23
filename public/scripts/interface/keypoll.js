define(['jquery'], function ($) {

  // KeyPoll object can be bound to a dom element, and listens for key events
  // related to that element. States of any key can be queried, a key is
  // currently pressed if polling returns true, if not polling returns false.
  //
  // Arguments:
  //   domID: CSS style selector used to specify which element to bind the
  //          key listening events for this instance of KeyPoll.
  //          Default: window
  var KeyPoll = function (domID) {
    var keypoll = this;

    keypoll.keys = Object.create(null);

    if (!domID) domID = window;

    $(domID).keyup(function (e) {
      keypoll.keys[e.which] = false;
    });

    $(domID).keydown(function (e) {
      keypoll.keys[e.which] = true;
    });
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

  
  return KeyPoll;
});
