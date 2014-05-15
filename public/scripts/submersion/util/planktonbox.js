define(['underscore', 'core/util/frame', 'core/util/subscriber',
        'core/util/random', 'submersion/actors/plankton',
        'submersion/util/layer'],
  function (_, Frame, Subscriber, Random, Plankton) {

    var INITIAL_PLANKTON_DENSITY = 0.0001;
    var MAXIMUM_PLANKTON_DENSITY = 0.0003;
    var MINIMUM_PLANKTON_DENSITY = 0.00005;
    var PLANKTON_DENSITY_STEP = 0.00005;

    // PlanktonBox manages an area of plankton, destroying any that leave
    // the enclosed area and ensuring a constant density of plankton within
    // the box
    //
    // Argument object with fields:
    //   dimensions: object with 'width' and 'height' fields
    //   origin: object with 'x' and 'y' fields
    var PlanktonBox = function (opts) {
      Frame.call(this, opts.dimensions, opts.origin);
      Subscriber.call(this);
      this.density = INITIAL_PLANKTON_DENSITY;
      this.step = 0;
      this.prevOrigin = _.clone(opts.origin);

      var box = this;
      this.register('actor.move', function (params) {
        if (params.actor instanceof Plankton && !box.contains(params.actor)) {
          params.actor.destroy();
        }
      });
      this.register('world.step', function () {
        box.step = (box.step + 1) % Plankton.DRIFT_FREQUENCY;
        if (box.step === 0) box.repopulate();
      });

      var dim = this.getDimensions();
      var origin = this.getOrigin();
      for (var i=origin.x; i<origin.x + dim.width; i++) {
        for (var j=origin.y; j<origin.y + dim.height; j++) {
          if (Random.probability(this.density)) {
            new Plankton({
              center: { x: i, y: j },
              layer: Random.integerWithinRange(Plankton.BASE_PLANKTON_LAYER,
                                               Plankton.TOP_PLANKTON_LAYER)
            });
          }
        }
      }
    };
    _.extend(PlanktonBox.prototype, Frame.prototype, Subscriber.prototype);
    PlanktonBox.prototype.constructor = PlanktonBox;


    // repopulate generates new plankton in the area that the frame has
    // moved since last repopulation
    PlanktonBox.prototype.repopulate = function () {
      var dim = this.getDimensions();
      var origin = this.getOrigin();
      var posDiff = { x: this.prevOrigin.x - origin.x,
                      y: this.prevOrigin.y - origin.y };
      this.prevOrigin = _.clone(origin);

      var range = {};
      if (posDiff.x >= 0) {
        range.x = { from: origin.x,
                    to: origin.x + Math.min(dim.width, posDiff.x) };
      }
      else {
        range.x = { from: origin.x +
                          Math.max(0, dim.width + posDiff.x),
                    to: origin.x + dim.width };
      }

      if (posDiff.y > 0) {
        range.y = { from: origin.y,
                    to: origin.y + Math.min(dim.height, posDiff.y) };
      }
      else if (posDiff.y < 0) {
        range.y = { from: origin.y +
                          Math.max(0, dim.height + posDiff.y),
                    to: origin.y + dim.height };
      }
      else {
        range.y = { from: origin.y, to: origin.y + 1 };
      }

      for (var i=origin.x; i<origin.x + dim.width; i++) {
        for (var j=range.y.from; j<range.y.to; j++) {
          if (Random.probability(this.density)) {
            new Plankton({
              center: { x: i, y: j },
              layer: Random.integerWithinRange(Plankton.BASE_PLANKTON_LAYER,
                                               Plankton.TOP_PLANKTON_LAYER)
            });
          }
        }
      }

      if (posDiff.y >= 0) {
        range.y.from = range.y.to;
        range.y.to = origin.y + dim.height;
      }
      else {
        range.y.to = range.y.from;
        range.y.from = origin.y;
      }

      for (var i=range.x.from; i<range.x.to; i++) {
        for (var j=range.y.from; j<range.y.to; j++) {
          if (Random.probability(this.density)) {
            new Plankton({
              center: { x: i, y: j },
              layer: Random.integerWithinRange(Plankton.BASE_PLANKTON_LAYER,
                                               Plankton.TOP_PLANKTON_LAYER)
            });
          }
        }
      }
    };


    // stepDensity modifies the density of the plankton field by discrete
    // increments
    //
    // Arguments:
    //   steps: Integer, positive or negative, change in density steps
    PlanktonBox.prototype.stepDensity = function (steps) {
      var proposed = this.density + steps * PLANKTON_DENSITY_STEP;
      this.density = Math.min(Math.max(MINIMUM_PLANKTON_DENSITY, proposed),
                              MAXIMUM_PLANKTON_DENSITY);
    };


    return PlanktonBox;
  }
);
