define(['underscore', 'core/actors/base', 'core/graphics/sprite',
        'submersion/util/group', 'submersion/util/layer'],
  function (_, Base, Sprite, Group, Layer) {

    var BASE_PLANKTON_LAYER = Layer.nearBackground;
    var TOP_PLANKTON_LAYER = Layer.frontFocus;
    var PLANKTON_COLOR = '#DDD';
    var DRIFT_FREQUENCY = 5;


    // randomPixels returns an array of between 1-4 pixels
    function randomPixels (count) {
      var seedPixels = [
        { x: 0, y: 0, color: PLANKTON_COLOR },
        { x: 1, y: 0, color: PLANKTON_COLOR },
        { x: 0, y: 1, color: PLANKTON_COLOR },
        { x: 1, y: 1, color: PLANKTON_COLOR }
      ];
      var returnPixels = [];

      while (count > 0) {
        var i = Math.floor(Math.random() * count--);
        returnPixels.push(seedPixels.splice(i, 1)[0]);
      }

      return randomPixels;
    }
      
    
    // Scenery actors, used to visualize current and make world more realistic
    //
    // Argument object fields:
    //   center: Center of the object, essentially location in the world
    //   layer: Layer that it occupies in a LayeredCanvas heirarchy
    var Plankton = function (opts) {
      if (opts.layer < BASE_PLANKTON_LAYER ||
          opts.layer > TOP_PLANKTON_LAYER) {
        throw new Error('Plankton cannot be created on layer ' + opts.layer);
      }

      var size = opts.layer - BASE_PLANKTON_LAYER;
      opts.sprite = new Sprite(randomPixels(size));
      opts.group = 'Plankton';
      opts.noncollidables = Group.collect('animals');

      Base.call(this, opts);

      // Plankton cannot collide with anything
      this.unregister('actionbox.collisions');

      this.steps = 0;
    };
    Plankton.prototype = Object.create(Base.prototype);
    Plankton.prototype.constructor = Plankton;

    
    // overloaded Base#act function
    Plankton.prototype.act = function () {
      if (this.steps === 0) {
        this.move({ x: Math.floor(Math.random()*3 - 1), y: 1 });
      }
      this.steps = (this.steps + 1)%DRIFT_FREQUENCY;
    };


    return Plankton;
  }
);
