define(['underscore', 'core/actors/base', 'core/graphics/sprite',
        'core/util/random', 'submersion/util/group'],
  function (_, Base, Sprite, Random, Group) {

    // CONSTANTS
    var FISH_DRIFT_FREQUENCY = 30;
    var FISH_DRIFT_VELOCITY = 0.1;  // Pixels per animation frame
    var FISH_MOVEMENT_PERIODS = 5;  // Number of periods each cycle of drift is
                                    // broken into, so all fish dont change at
                                    // once

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

    
    function collectSpritePixels(sprite, centers, epicenter) {
      return _.reduce(centers, function(memo, c) {
        return memo.concat(sprite.pixels({ x: Math.round(c.x + epicenter.x),
                                           y: Math.round(c.y + epicenter.y) }));
      }, []);
    }


    // shuffle an array of objects and return the result
    //
    // Returns an array containing the same objects in randomized order
    function shuffle(ary) {
      var i = ary.length;

      while(i > 0) {
        var j = Random.integerWithinRange(0, --i);
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
    //     sprite: Instance of Sprite representing to build into a school
    //     center: Center of the object, essentially location in the world
    //     layer: Layer that it occupies in a LayeredCanvas heirarchy
    //     count: Number of fish in the school
    //     density: Number of fish in the area occupied by a single fish
    //              (because a school has depth as well)
    //     frameClock: instance of FrameClock class
    //     velocity: Velocity of the school, with 'x' and 'y' fields
    var FishSchool = function (opts) {

      this.drift = null;
      this.fish = [];
      this.fishDensity = null;
      this.frameClock = opts.frameClock;
      this.maxRadius = null;
      this.templateSprite = opts.sprite;
      this.velocity = _.clone(opts.velocity);

      var spriteBounds = opts.sprite.bounds();
      var spriteArea = (spriteBounds.xmax - spriteBounds.xmin + 1) *
                       (spriteBounds.ymax - spriteBounds.ymin + 1);
      var maxArea = (opts.count/opts.density) * spriteArea;
      this.fishDensity = opts.density/spriteArea;
      this.maxRadius = Math.sqrt(maxArea/Math.PI);

      circularPath({ x: 0, y: 0 });
      while (this.fish.length < opts.count) {
        var pos = circularPath();
        if (Random.probability(this.fishDensity)) {
          this.fish.push({ o: _.clone(pos), v: { x: 0, y: 0 }});
        }
      }
      this.fish = shuffle(this.fish);
      var offsets = _.map(this.fish, function (f) { return f.o; });

      opts.group = 'FishSchool';
      opts.noncollidables = Group.collect('friendlies');
      opts.sprite = new Sprite(collectSpritePixels(this.templateSprite,
                                                   offsets, opts.center));
      Base.call(this, opts);


      // setup periodically changing fish drift within school
      var school = this;
      var period = 0;
      var fishPerPeriod = school.fish.length/FISH_MOVEMENT_PERIODS;
      fishPerPeriod = Math.ceil(fishPerPeriod);
      this.drift = this.frameClock.recurring(function () {

        var start = fishPerPeriod * period;
        var end = start + fishPerPeriod;
        if (end > school.fish.length) {
          end = school.fish.length;
        }

        period = (period + 1) % FISH_MOVEMENT_PERIODS;

        for (var i=start; i<end; i++) {
          school.fish[i].v.x = Random.integerWithinRange(-1, 1) *
                                FISH_DRIFT_VELOCITY;
          school.fish[i].v.y = Random.integerWithinRange(-1, 1) *
                                FISH_DRIFT_VELOCITY;
        }
      }, FISH_DRIFT_FREQUENCY/FISH_MOVEMENT_PERIODS);
    };
    FishSchool.prototype = Object.create(Base.prototype);
    FishSchool.prototype.constructor = FishSchool;


    // overloaded Base.act function
    FishSchool.prototype._act = function () {

      var newRadius = 0;

      _.each(this.fish, function (f) {
        newRadius = Math.sqrt(Math.pow(f.o.x + f.v.x, 2) +
                    Math.pow(f.o.y + f.v.y, 2));

        if (newRadius > this.maxRadius) {
          if (f.o.x !== 0) f.v.x = -1 * FISH_DRIFT_VELOCITY *
                                   (f.o.x/Math.abs(f.o.x));
          if (f.o.y !== 0) f.v.y = -1 * FISH_DRIFT_VELOCITY *
                                   (f.o.y/Math.abs(f.o.y));
        }

        f.o.x += f.v.x;
        f.o.y += f.v.y;
      }, this);

      var offsets = _.map(this.fish, function (f) {
        return { x: Math.floor(f.o.x), y: Math.floor(f.o.y) };
      });
      this.sprite = new Sprite(collectSpritePixels(this.templateSprite,
                                                   offsets, this.center));

      this.move(this.velocity);
    };


    return FishSchool;
  }
);
