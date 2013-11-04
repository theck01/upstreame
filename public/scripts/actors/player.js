define(['actors/base'], function (Base) {
  
  // Player actor, controlled directly by keyboard (or other) input
  //
  // Arguments:
  //   archive: SpriteArchive object
  //   center: center of the player sprite
  //   layer: layer to draw the player sprite
  //   keypoll: KeyPoll object, used for controlling sprite
  var Player = function (archive, center, layer, keypoll) {
    Base.call(this, archive.get('human-ship'), center, layer, ['Player']);
		this.archive = archive;
    this.type = 'Player';
    this.keypoll = keypoll;
  };
  Player.prototype = Object.create(Base.prototype);
  Player.prototype.constructor = Player;


  // update checks inputs and takes corresponding actions.
  Player.prototype.update = function () {
    var directions = [];
    var verticalChange = 0;

    if (this.keypoll.poll(87)) {
      directions.push('UP');
      verticalChange += 1;
    }
    if (this.keypoll.poll(83)) {
			directions.push('DOWN');
      verticalChange -= 1;
    }
    if (this.keypoll.poll(65)) directions.push('LEFT');
    if (this.keypoll.poll(68)) directions.push('RIGHT');

    this.shift(directions);
    
    // change sprite to reflect movement, if any
    if (verticalChange === 1) {
      this.sprite = this.archive.get('human-ship-accelerating');
    }
    else if (verticalChange === 0) {
      this.sprite = this.archive.get('human-ship');
    }
    else {
      this.sprite = this.archive.get('human-ship-braking');
    }
  };


  return Player;
});
