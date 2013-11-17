define(['actors/base'], function (Base) {

  // Constants
  var ANIMATION_FRAME_RATE = 2; // frames per sprite
  var ANIMATION_CELLS = 8;

  // EnergyEnemy actor
  //
  // Arguments:
  //   group: Group that the EnergyEnemy will belong to
  //   archive: SpriteArchive object
  //   center: center of the actor's sprite
  //   layer: layer to draw the actor's sprite
  //   frameClock: FrameClock object
  var EnergyEnemy = function (group, archive, center, layer, frameClock) {
    Base.call(this, group, archive.get('energy-ship-big1'), center,
              layer, [group]);

    var enemy = this;
    var frame = 0;
    frameClock.recurring(function () {
      var spriteName = 'energy-ship-big';
      spriteName += (Math.floor(frame/ANIMATION_FRAME_RATE) + 1).toString();
      frame = (frame + 1) % (ANIMATION_FRAME_RATE * ANIMATION_CELLS);
      enemy.sprite = archive.get(spriteName);
    }, ANIMATION_FRAME_RATE);
  };
  EnergyEnemy.prototype = Object.create(Base.prototype);
  EnergyEnemy.prototype.constructor = EnergyEnemy;


  // overloaded Base.act function
  EnergyEnemy.prototype.act = function () {};


  return EnergyEnemy;
});
