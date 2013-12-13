define(['underscore', 'core/graphics/spritearchive', 'core/actors/base'],
    function (_, SpriteArchive, Base) {

      // CONSTANTS
      var SPEED = 4;
      var OPPOSING_SPEED = 2;
      var DIAGONAL_SPEED = SPEED / Math.sqrt(2);
      var OPPOSING_DIAGONAL_SPEED = OPPOSING_SPEED / Math.sqrt(2);
      var ROTATION_SPEED = 3;
      var ROTATION_STEP = 20;
      var ROTATION_MAX = 170;
      var ROTATION_MIN = 10;
      
      // Submarine actor, controlled directly by keyboard input
      //
      // Arguments:
      //   opts: object with the following required fields
      //     group: Collision group that the new player will belong to
      //     center: center of the player sprite
      //     layer: layer to draw the player sprite
      //     noncollidables: Array of strings describing groups with which the
      //                     new instance cannot collide
      //     frameClock: FrameClock object
      //     keypoll: KeyPoll object, used for controlling sprite
      var Submersible = function (opts) {
        opts.sprite = SpriteArchive.get('submersible-170');
        Base.call(this, opts);
        this.frameClock = opts.frameClock;
        this.keypoll = opts.keypoll;
        this.orientation = 180;
        this.direction = 1;

        var sub = this;
        this.scheduledRotation = this.frameClock.recurring(function () {
          // turn submarine
          if (sub.direction === 1) {
            sub.orientation = Math.min(sub.orientation + ROTATION_STEP,
                                       ROTATION_MAX);
          }
          else {
            sub.orientation = Math.max(sub.orientation - ROTATION_STEP,
                                       ROTATION_MIN);
          }
          sub.sprite = SpriteArchive.get('submersible-' + sub.orientation);
        }, ROTATION_SPEED);
      };
      Submersible.prototype = Object.create(Base.prototype);
      Submersible.prototype.constructor = Submersible;


      // overloaded Base.act function
      Submersible.prototype.act = function () {
        var verticalChange = 0;
        var horizontalChange = 0;

        if (this.keypoll.poll(87)) verticalChange -= 1;
        if (this.keypoll.poll(83)) verticalChange += 1;
        if (this.keypoll.poll(65)) horizontalChange -= 1;
        if (this.keypoll.poll(68)) horizontalChange += 1;
        if (this.keypoll.poll(32)) this.fire();

        // set direction according to most recent key press
        if (horizontalChange === -1) this.direction = -1;
        else if (horizontalChange === 1) this.direction = 1;

        // if not fully rotated for direction of movement, do nothing
        var speed = SPEED;
        var diagSpeed = DIAGONAL_SPEED;
        if ((this.direction === 1 && this.orientation !== ROTATION_MAX) ||
            (this.direction === -1 && this.orientation !== ROTATION_MIN)) {
           speed = OPPOSING_SPEED;
           diagSpeed = OPPOSING_DIAGONAL_SPEED;
        }

        if (horizontalChange && verticalChange) {
          this.center.x += diagSpeed * horizontalChange;
          this.center.y += diagSpeed * verticalChange;
        }
        else if (horizontalChange) {
          this.center.x += speed * horizontalChange;
        }
        else {
          this.center.y += speed * verticalChange;
        }
      };

      return Submersible;
  }
);
