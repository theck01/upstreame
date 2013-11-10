define(['actors/base'], function (Base) {

  // Constants
  var ANIMATION_FRAME_RATE = 2; // frames per sprite
  var ANIMATION_CELLS = 8;

  // EnergyEnemy actor
  //
  // Arguments:
  //   archive: SpriteArchive object
  //   center: center of the actor's sprite
  //   layer: layer to draw the actor's sprite
  var EnergyEnemy = function (archive, center, layer) {
    Base.call(this, 'EnergyEnemy', archive.get('energy-ship-big1'), center,
              layer, ['EnergyEnemy']);
    this.archive = archive;
    this.frame = 0;
  };
  EnergyEnemy.prototype = Object.create(Base.prototype);
  EnergyEnemy.prototype.constructor = EnergyEnemy;


  // overloaded Base.act function
  EnergyEnemy.prototype.act = function () {
    var spriteName = 'energy-ship-big';
    spriteName += (Math.floor(this.frame/ANIMATION_FRAME_RATE) + 1).toString();
    this.frame = (this.frame + 1) % (ANIMATION_FRAME_RATE * ANIMATION_CELLS);
    this.sprite = this.archive.get(spriteName);
  };


  return EnergyEnemy;
});
