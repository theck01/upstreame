define(['underscore', 'core/actors/base', 'core/graphics/spritearchive'],
  function (_, Base, SpriteArchive) {

    // SeaCreature forms the base for a number of different sea creatures with
    // simple movement and animation patterns
    //
    // Argument object fields:
    //   group: String group name of the object ['Enemy', 'Player', etc]
    //   center: Center of the object, essentially location in the world
    //   layer: Layer that it occupies in a LayeredCanvas heirarchy
    //   noncollidables: Array of strings describing groups with which the new
    //                   instance cannot collide
    //   animation: List of objects with 'spriteName' and 'frames' fields, used
    //              to display the creatures animation when played in a loop
    //   frameClock: frameClock that drives animation
    //   velocity: Object with 'x' and 'y' fields
    var SeaCreature = function (opts) {
      opts.sprite = SpriteArchive.get(opts.animation[0].spriteName);
      Base.call(this, opts);

      this.animation = _.clone(opts.animation);
      this.frameClock = opts.frameClock;
      this.velocity = opts.velocity;
      this.frame = 0;

      var creature = this;
      var nextFrame = function () {
        creature.frame = (creature.frame+1)%creature.animation.length;

        var animationFrame = creature.animation[creature.frame];
        creature.sprite = SpriteArchive.get(animationFrame.spriteName);

        var next = creature.frameClock.schedule(nextFrame,
                                                animationFrame.frames);
        this.scheduledAnimation = next;
      };

      var firstFrames = this.animation[0].frames;
      this.scheduledAnimation = this.frameClock.schedule(nextFrame,
                                                         firstFrames);
    };
    SeaCreature.prototype = Object.create(Base.prototype);
    SeaCreature.prototype.constructor = Base.prototype.constructor;


    // act moves SeaCreature
    SeaCreature.prototype.act = function () {
      this.move(this.velocity);
    };


    // overloaded destroy cancels animation callbacks
    SeaCreature.prototype.destroy = function () {
      this.frameClock.cancel(this.nextFrame);
      Base.prototype.destroy.call(this);
    };


    return SeaCreature;
  }
);
