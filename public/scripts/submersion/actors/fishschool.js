define(['underscore', 'core/actors/base', 'core/graphics/sprite'],
  function (_, Base, Sprite) {

    // HELPER FUNCTIONS

    // circularPath function used to traverse the set of pixels encircling a
    // center seed position in clockwise order, expanding the circle as the
    // sequence expands
    //
    // Arguments:
    //   seedPosition: optional, if specified starts a new sequence centering on
    //                 object with 'x' and 'y' fields
    //
    // Returns an object with 'x' and 'y' fields representing next position in
    // the path
    function circularPath(seedPosition) {
      if (seedPosition) {
        this.offset = 1;
        this.pos = { x: seedPosition.x, y: seedPosition.y - 1 };
        this.center = _.clone(seedPosition);
        return _.clone(this.pos);
      }
      
      if ((this.pos.x === this.center.x - this.offset) &&
          (this.pos.y === this.center.y - this.offset)) {
        this.offset++;
        this.pos = { x: this.center.x - this.offset + 1,
                     y: this.center.y - this.offset };
      }
      else if (this.pos.x === this.center.x - this.offset) this.pos.y -= 1;
      else if (this.pos.y === this.center.y + this.offset) this.pos.x -= 1;
      else if (this.pos.x === this.center.x + this.offset) this.pos.y += 1;
      else if (this.pos.y === this.center.y - this.offset) this.pos.x += 1;

      return _.clone(this.pos);
    }

    
    function collectSpritePixels(sprite, centers) {
      return _.reduce(centers, function(memo, c) {
        return memo.concat(sprite.pixels(c));
      }, []);
    }


    // shuffle an array of objects and return the result
    //
    // Returns an array containing the same objects in randomized order
    function shuffle(ary) {
      var i = ary.length;

      while(i > 0) {
        var j = Math.floor(Math.random() * (i--));
        var tmp = ary[i];
        ary[i] = ary[j];
        ary[j] = tmp;
      }

      return ary;
    }


    // FishSchool 
    //
    // Arguments:
    //   opts: object with the following required fields
    //     group: String group name of the object ['Enemy', 'Player', etc]
    //     sprite: Instance of Sprite representing to build into a school
    //     center: Center of the object, essentially location in the world
    //     layer: Layer that it occupies in a LayeredCanvas heirarchy
    //     noncollidables: Array of strings describing groups with which the new
    //                     instance cannot collide
    //     count: Number of fish in the school
    //     density: Number of fish in the area occupied by a single fish
    //              (because a school has depth as well)
    var FishSchool = function (opts) {
      this.fishCenters = [];

      var spriteBounds = opts.sprite.bounds();
      var spriteArea = (spriteBounds.xmax - spriteBounds.xmin + 1) *
                       (spriteBounds.ymax - spriteBounds.ymin + 1);
      this.fishDensity = opts.density/spriteArea;

      var maxArea = opts.count * this.fishDensity;
      this.maxRadius = Math.ceil(Math.sqrt(maxArea/Math.PI));

      circularPath(opts.center);
      while (this.fishCenters.length < opts.count) {
        var pos = circularPath();
        if (Math.random() < this.fishDensity) this.fishCenters.push(pos);
      }
      this.fishCenters = shuffle(this.fishCenters);

      this.templateSprite = opts.sprite;
      opts.sprite = new Sprite(collectSpritePixels(this.templateSprite,
                                                   this.fishCenters));

      Base.call(this, opts);
    };
    FishSchool.prototype = Object.create(Base.prototype);
    FishSchool.prototype.constructor = FishSchool;

    return FishSchool;
  }
);
