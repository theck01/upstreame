define(['underscore', 'core/graphics/spritearchive', 'core/actors/base'],
    function (_, SpriteArchive, Base) {

      // CONSTANTS
      var SPEED = 4;
      var OPPOSING_SPEED = 2;
      var DIAGONAL_SPEED = SPEED / Math.sqrt(2);
      var OPPOSING_DIAGONAL_SPEED = OPPOSING_SPEED / Math.sqrt(2);
      var ROTATION_SPEED = 3;
      var YAW_STEP = 20;
      var YAW_MAX = 170;
      var YAW_MIN = 10;
      var PITCH_STEP = 20;
      var PITCH_MIN = -20;
      var PITCH_MAX = 20;
      var DIAGONAL_PITCH_STEP = 10;
      var DIAGONAL_PITCH_MIN = -10;
      var DIAGONAL_PITCH_MAX = 10;
      
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
        opts.sprite = SpriteArchive.get('submersible-pitch-0-yaw-170');
        Base.call(this, opts);
        this.frameClock = opts.frameClock;
        this.keypoll = opts.keypoll;
        this.pitch = 0;
        this.yaw = 170;
        this.direction = { x: 1, xvel: 0, y: 0 };

        var sub = this;
        this.scheduledRotation = this.frameClock.recurring(function () {

          var spriteName = 'submersible-pitch-';

          // turn submarine
          sub.yaw = Math.min(sub.yaw + YAW_STEP * sub.direction.x, YAW_MAX);
          sub.yaw = Math.max(sub.yaw, YAW_MIN);

          if (sub.direction.y === 0) sub.pitch = 0;
          else {
            // check for special case of full diagonal movement
            if ((sub.yaw === YAW_MIN && sub.direction.xvel === -1) ||
                (sub.yaw === YAW_MAX && sub.direction.xvel === 1)) {
              sub.pitch += DIAGONAL_PITCH_STEP * sub.direction.y * -1;
              sub.pitch = Math.min(sub.pitch, DIAGONAL_PITCH_MAX);
              sub.pitch = Math.max(sub.pitch, DIAGONAL_PITCH_MIN);
            }
            else {
              sub.pitch += PITCH_STEP * sub.direction.y * -1;
              sub.pitch = Math.min(sub.pitch, PITCH_MAX);
              sub.pitch = Math.max(sub.pitch, PITCH_MIN);
            }
          }

          if (sub.pitch < 0) spriteName += 'neg' + (-1 * sub.pitch).toString();
          else spriteName += sub.pitch.toString();

          spriteName += '-yaw-' + sub.yaw.toString();
          sub.sprite = SpriteArchive.get(spriteName);
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
        if (horizontalChange !== 0) this.direction.x = horizontalChange;
        this.direction.xvel = horizontalChange;
        this.direction.y = verticalChange;

        // if not fully rotated for direction of movement, move at reduced speed
        var speed = { x: SPEED, y: SPEED, diagx: DIAGONAL_SPEED,
                      diagy: DIAGONAL_SPEED };
        if ((this.direction.x === 1 && this.yaw !== YAW_MAX) ||
            (this.direction.x === -1 && this.yaw !== YAW_MIN)) {
           speed.x = OPPOSING_SPEED;
           speed.diagx = OPPOSING_DIAGONAL_SPEED;
        }
        if ((this.direction.y === 1 && this.pitch !== PITCH_MIN &&
             this.pitch !== DIAGONAL_PITCH_MIN) ||
            (this.direction.y === -1 && this.pitch !== PITCH_MAX &&
             this.pitch !== DIAGONAL_PITCH_MAX)) {
           speed.y = OPPOSING_SPEED;
           speed.diagy = OPPOSING_DIAGONAL_SPEED;
        }

        if (horizontalChange && verticalChange) {
          this.center.x += speed.diagx * horizontalChange;
          this.center.y += speed.diagy * verticalChange;
        }
        else if (horizontalChange) {
          this.center.x += speed.x * horizontalChange;
        }
        else {
          this.center.y += speed.y * verticalChange;
        }
      };

      return Submersible;
  }
);
