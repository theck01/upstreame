require.config({
  baseUrl: "scripts",
  paths: {
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min",
    underscore: "/underscore-amd/underscore-min"
  }
});

require(["jquery", "underscore"],
  function($,_){
    // initializiation of client side application
    console.log("hello");
    console.log($);
    console.log(_);
  }
);
