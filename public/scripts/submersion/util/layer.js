define([], function () {
  var Layer = {
    farBackground: 0,
    background: 1,
    nearBackground: 2,
    rearFocus: 3,
    mainFocus: 4,
    frontFocus: 5,
    foreground: 6
  };


  // return a random layer between two layers, inclusive
  //
  // Arguments:
  //   bg: Integer, the most background layer possibly selected
  //   fg: Integer, the most forground layer possibly selected
  Layer.random = function (bg, fg) {
    var range = fg - bg;
    return Math.floor(Math.random() * range) + bg;
  };

  return Layer;
});
