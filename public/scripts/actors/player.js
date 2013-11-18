define(['underscore', 'actors/base', 'actors/projectile', 'util/game'],
    function (_, Base, Projectile, Game) {

      // CONSTANTS
      var SPEED = 2;
      var DIAGONAL_SPEED = SPEED / Math.sqrt(2);
      var FIRE_COOLDOWN = 15;
      
      // Player actor, controlled directly by keyboard (or other) input
      //
      // Arguments:
      //   group: Collision group that the new player will belong to
      //   archive: SpriteArchive object
      //   center: center of the player sprite
      //   layer: layer to draw the player sprite
      //   keypoll: KeyPoll object, used for controlling sprite
      var Player = function (group, archive, center, layer, keypoll) {
        Base.call(this, group, archive.get('human-ship'), center, layer,
                  [group]);
        this.archive = archive;
        this.keypoll = keypoll;
        this.fireReady = true;
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

        this.sprite = this.archive.get(spriteName);
      
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


      // fire a laser shot from the center of the ship
      Player.prototype.fire = function () {

        if (!this.fireReady) return;

        this.fireReady = false;

        var player = this;
        Game.clock.schedule(function () {
          player.fireReady = true;
        }, FIRE_COOLDOWN);

        var simplePath = function () {
          return { x: this.center.x, y: this.center.y - SPEED*2 };
        };

        var leftCenter = { x: this.center.x - 10, y: this.center.y - 9 };
        var rightCenter = { x: this.center.x + 9, y: this.center.y - 9 };

        var p = new Projectile(this.group, this.archive.get('human-ship-laser'),
                               leftCenter, this.layer, [this.group],
                               simplePath);
        Game.world.add(p);

        p = new Projectile(this.group, this.archive.get('human-ship-laser'),
                           rightCenter, this.layer, [this.group],
                           simplePath);
        Game.world.add(p);
      };


      return Player;
  }
);
