({
  baseUrl: "../public/scripts",
  packages: [{
    location: "../../bower_components/domkit/domkit",
    name: "domkit",
    main: "domkit"
  }],
  paths: {
    bootstrap: "../../bower_components/bootstrap/dist/js/bootstrap.min",
    jquery: "../../bower_components/jquery/jquery.min",
    underscore: "../../bower_components/underscore-amd/underscore-min"
  },
  name: "pixeleditor/main",
  out: "../public/scripts/dist/pixeleditor.min.js"
})
