// Javascript for the toollayout login form
define(["jquery", "core/interface/statusalert"], function ($, StatusAlert) {
    var statusAlert = new StatusAlert("#status-alert");

    $("#login-button").click(function () {
      $.ajax({
        url: "/login",
        type: "POST",
        data: {
          "username": $("#username-field").val(),
          "password": $("#password-field").val()
        },
        success: function () {
          statusAlert.display("Welcome back!", false);
          $("#login-form").attr("hidden", true);
          $("#logout-form").attr("hidden", false);
        },
        error: function (jqXHR) {
          if(jqXHR.status  === 401) {
            statusAlert.display("Username or password incorrect. " +
                                "Please try again.", true);
          }
          else statusAlert.display("Server error.", true);
        }
      });

      $("#username-field").val("");
      $("#password-field").val("");
    });

    $("#logout-button").click(function () {
      $.ajax({
        url: "/logout",
        type: "POST",
        success: function () {
          statusAlert.hide();
          $("#login-form").attr("hidden", false);
          $("#logout-form").attr("hidden", true);
        },
        error: function (jqXHR) {
          if(jqXHR.status === 500) {
            statusAlert.display("Server error.", true);
          }
          else statusAlert.display("Client error.", true);
        }
      });
    });
});
