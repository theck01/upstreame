define(['actors/base'], function (Base) {

  // CONSTANTS
  var SPEED = 2;
  var DIAGONAL_SPEED = SPEED / Math.sqrt(2);
  
  // Player actor, controlled directly by keyboard (or other) input
  //
  // Arguments:
  //   archive: SpriteArchive object
  //   center: center of the player sprite
  //   layer: layer to draw the player sprite
  //   keypoll: KeyPoll object, used for controlling sprite
  var Player = function (archive, center, layer, keypoll) {
    Base.call(this, 'Player', archive.get('human-ship'), center, layer,
              ['Player']);
		this.archive = archive;
    this.keypoll = keypoll;
  };
  Player.prototype = Object.create(Base.prototype);
  Player.prototype.constructor = Player;


  // overloaded Base.act function
  Player.prototype.act = function () {
    var verticalChange = 0;
    var horizontalChange = 0;

    if (this.keypoll.poll(87)) verticalChange -= 1;
    if (this.keypoll.poll(83)) verticalChange += 1;
    if (this.keypoll.poll(65)) horizontalChange -= 1;
    if (this.keypoll.poll(68)) horizontalChange += 1;

    // change sprite to reflect movement, if any
    if (verticalChange === -1) {
      this.sprite = this.archive.get('human-ship-accelerating');
    }
    else if (verticalChange === 0) {
      this.sprite = this.archive.get('human-ship');
    }
    else {
      this.sprite = this.archive.get('human-ship-braking');
    }
  
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


  return Player;
});
