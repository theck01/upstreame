define([], function () {

  // Game singleton provides a central access point to often needed structures,
  // such as the game World, FrameClock, *Canvas, etc.
  var Game = Object.create(null);

  return Game;
});
