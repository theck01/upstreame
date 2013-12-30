define(["jquery"], function ($) {

  // StatusAlert object encapsulates a bootstrap alert and provides methods for
  // displaying errors and success messages, as well as hiding the alert
  var StatusAlert = function (alertID) {
    var sa = this;

    sa.$statusAlert = $(alertID);
    sa.$statusAlert.click(function () {
      sa.hide();
    });
  };

  StatusAlert.prototype.display = function (message, error) {
    if (error) {
      this.$statusAlert.addClass("alert-danger");
      this.$statusAlert.removeClass("alert-success");
    }
    else {
      this.$statusAlert.removeClass("alert-danger");
      this.$statusAlert.addClass("alert-success");
    }

    this.$statusAlert.text(message);
    this.$statusAlert.prop("hidden", false);
    this.$statusAlert.removeClass("animated bounce");
    this.$statusAlert.addClass("animated bounce");
  };

  StatusAlert.prototype.hide = function () {
    this.$statusAlert.prop("hidden", true);
  };

  return StatusAlert;
});
