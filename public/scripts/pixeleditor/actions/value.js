define(
    ['underscore', 'domkit/util/handlercollection'],
    function (_, HandlerCollection) {
  // Value tracks a value and triggers handlers when the value changes.
  //
  // Arguments:
  //     initialValue
  //     opt_initialValidator:
  //         Function that takes the new value as an argument and returns the
  //         validated form of the argument, or null if the value is malformed.
  //         Optional, no validation performed if not specified.
  var Value = function (initialValue, opt_initialValidator) {
    HandlerCollection.call(this);
    this._value = null;
    this._validator = opt_initialValidator || function (value) {
      return value;
    };
    this.setValue(initialValue);
  };
  Value.prototype = Object.create(HandlerCollection.prototype);
  Value.prototype.constructor = Value;


  // addValueChangeHandler registers a callback for when the value changes.
  //
  // Arguments:
  //     handler:
  //         A function that takes the new value as an argument.
  Value.prototype.addValueChangeHandler = Value.prototype._addHandler;


  // getValue returns the value stored.
  // recently used to least recently used.
  Value.prototype.getValue = function () {
    return this._value;
  };


  // setValue sets the value and calls all handlers with the new value if the
  // value changes and is valid.
  //
  // Arguments:
  //     newValue
  Value.prototype.setValue = function (newValue) {
    var validatedValue = this._validator(newValue);
    if (validatedValue !== null && !_.isEqual(this._value, validatedValue)) {
      this._value = validatedValue;
      this._callHandlers(this._value);
    }
  };


  // setValidator sets the validation function to be used to verify that the
  // value can be set appropriately.
  //
  // Arguments:
  //     validator:
  //         Function that takes the new value as an argument and returns the
  //         validated form of the argument, or null if the value is malformed.
  Value.prototype.setValidator = function (validator) {
    this._validator = validator;
  };


  // removeValueChangeHandler removes a callback for when the value changes.
  //
  // Arguments:
  //     handler:
  //         A function that takes the new value on a change.
  Value.prototype.removeValueChangeHandler = Value.prototype._removeHandler;


  return Value;
});
