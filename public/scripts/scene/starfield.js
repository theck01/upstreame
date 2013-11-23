define(['underscore'], function (_) {

  var DRIFT_FREQUENCY = 2;
  var STAR_DENSITY = 0.0004577;
  var STAR_COLOR = '#FFFFCC';


  // Starfield scenery is a background with slowly shifting, randomly generated
  // stars
  //
  // Arguments:
  //   dimensions: object with 'width' and 'height' fields, area stars can
  //               occupy
  //   driftVelocity: object with 'x' and 'y', shift distance per update 
  //   layer: layer on which to draw star fields in a *Canvas
  //   frameClock: FrameClock instance to register recurring drift event
  var Starfield = function (dimensions, driftVelocity, layer, frameClock) {
    this.layer = layer;

    this.stars = [];
    for (var i=0; i<dimensions.width; i++) {
      for (var j=0; j<dimensions.height; j++) {
        if (Math.random() < STAR_DENSITY) this.stars.push({ x: i, y: j });
      }
    }

    var field = this;

    // set up recurring event to initiate starfield drift
    frameClock.recurring(function () {

      // shift stars
      field.stars = _.reduce(field.stars, function (memo, s) {
        var drifted = { x: s.x + driftVelocity.x, y: s.y + driftVelocity.y };
        if (drifted.x >= 0 && drifted.x  < dimensions.width && drifted.y >= 0 &&
            drifted.y < dimensions.height) {
          memo.push(drifted);
        }

        return memo;
      }, [], field);


      // determine portion of the screen that needs new stars
      var replaceBounds = Object.create(null);
      if (driftVelocity.x > 0) {
        replaceBounds.leftmost = 0;
        replaceBounds.rightmost = Math.ceil(driftVelocity.x) - 1;
        replaceBounds.startx = replaceBounds.rightmost + 1;
        replaceBounds.endx = dimensions.width - 1;
      }
      else {
        replaceBounds.leftmost = dimensions.width + Math.ceil(driftVelocity.x);
        replaceBounds.rightmost = dimensions.width - 1;
        replaceBounds.startx = 0;
        replaceBounds.endx = replaceBounds.leftmost - 1;
      }

      if (driftVelocity.y > 0) {
        replaceBounds.topmost = 0;
        replaceBounds.bottommost = driftVelocity.y - 1;
      }
      else {
        replaceBounds.topmost = dimensions.height + driftVelocity.y;
        replaceBounds.bottommost = dimensions.height - 1;
      }

      // add any new stars to the screen
      for (var i=replaceBounds.leftmost; i<=replaceBounds.rightmost; i++) {
        for (var j=0; j<dimensions.height; j++) {
          if (Math.random() < STAR_DENSITY) field.stars.push({ x: i, y: j });
        }
      }

      for (var i=replaceBounds.startx; i<=replaceBounds.endx; i++) {
        for (var j=replaceBounds.topmost; j<=replaceBounds.bottommost; j++) {
          if (Math.random() < STAR_DENSITY) field.stars.push({ x: i, y: j });
        }
      }
    }, DRIFT_FREQUENCY);
  };

    
  // paints the Starfield instance to a *Canvas
  //
  // Arguments:
  //   canvas: instance of *Canvas to paint on
  Starfield.prototype.paint = function (canvas) {
    _.each(this.stars, function (s) {
      canvas.setPixel(Math.floor(s.x), Math.floor(s.y), STAR_COLOR, this.layer);
    }, this);
  };

  return Starfield;
});
