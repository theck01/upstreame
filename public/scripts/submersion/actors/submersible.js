define(['underscore', 'core/graphics/spritearchive', 'core/actors/base'],
    function (_, SpriteArchive, Base) {

      // CONSTANTS
      var SPEED = 5;
      var DIAGONAL_SPEED = SPEED / Math.sqrt(2);
      var ROTATION_SPEED = 4;
      
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
        opts.sprite = SpriteArchive.get('submersible-180');
        Base.call(this, opts);
        this.frameClock = opts.frameClock;
        this.keypoll = opts.keypoll;
        this.orientation = 180;
        this.direction = 1;

        var sub = this;
        this.scheduledRotation = this.frameClock.recurring(function () {
          // turn submarine
          if (sub.direction === 1) {
            sub.orientation = Math.min(sub.orientation + 30, 180);
          }
          else sub.orientation = Math.max(sub.orientation - 30, 0);
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

        this.sprite = SpriteArchive.get('submersible-' + this.orientation);
      
        if (horizontalChange && verticalChange) {
          this.center.x += DIAGONAL_SPEED * horizontalChange;
          this.center.y += DIAGONAL_SPEED * verticalChange;
        }
        else if (horizontalChange) {
          this.center.x += SPEED * horizontalChange;
        }
        else {
          this.center.y += SPEED * verticalChange;
        }
      };

      return Submersible;
  }
);
