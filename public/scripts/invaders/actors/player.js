define(['underscore', 'core/graphics/spritearchive', 'core/actors/base',
        'invaders/actors/projectile'],
    function (_, SpriteArchive, Base, Projectile) {

      // CONSTANTS
      var SPEED = 2;
      var DIAGONAL_SPEED = SPEED / Math.sqrt(2);
      var FIRE_COOLDOWN = 15;
      
      // Player actor, controlled directly by keyboard (or other) input
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
      //   optional fields for the opts param:
      //     onDestroy: extra cleanup that takes place when the actor is
      //                destroyed
      var Player = function (opts) {
        opts.sprite = SpriteArchive.get('human-ship');
        Base.call(this, opts);
        this.frameClock = opts.frameClock;
        this.fireReady = true;
        this.keypoll = opts.keypoll;
      };
      Player.prototype = Object.create(Base.prototype);
      Player.prototype.constructor = Player;


      // overloaded Base.act function
      Player.prototype.act = function () {
        var spriteName = 'human-ship';
        var verticalChange = 0;
        var horizontalChange = 0;

        if (this.keypoll.poll(87)) verticalChange -= 1;
        if (this.keypoll.poll(83)) verticalChange += 1;
        if (this.keypoll.poll(65)) horizontalChange -= 1;
        if (this.keypoll.poll(68)) horizontalChange += 1;
        if (this.keypoll.poll(32)) this.fire();

        // change sprite to reflect movement, if any
        if (horizontalChange === -1) spriteName += '-left-turn';
        else if (horizontalChange === 1) spriteName += '-right-turn';
        if (verticalChange === -1) spriteName += '-accelerating';
        else if (verticalChange === 1) spriteName += '-braking';

        this.sprite = SpriteArchive.get(spriteName);
      
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


      Player.prototype.collision = function () {
        this.destroy();
      };


      // fire a laser shot from the center of the ship
      Player.prototype.fire = function () {

        if (!this.fireReady) return;

        this.fireReady = false;

        var player = this;
        this.frameClock.schedule(function () {
          player.fireReady = true;
        }, FIRE_COOLDOWN);

        var simplePath = function () {
          return { x: this.center.x, y: this.center.y - SPEED*2 };
        };

        var leftCenter = { x: this.center.x - 10, y: this.center.y - 9 };
        var rightCenter = { x: this.center.x + 9, y: this.center.y - 9 };

        new Projectile({
          group: this.group,
          sprite: SpriteArchive.get('human-ship-laser'),
          center: leftCenter,
          layer: this.layer(),
          noncollidables: [this.group],
          path: simplePath
        });
        new Projectile({
          group: this.group,
          sprite: SpriteArchive.get('human-ship-laser'),
          center: rightCenter,
          layer: this.layer(),
          noncollidables: [this.group],
          path: simplePath
        });
      };


      return Player;
  }
);
