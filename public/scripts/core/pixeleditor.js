require.config({
  baseUrl: 'scripts',
  packages: [{
    location: '/domkit/domkit',
    name: 'domkit',
    main: 'domkit'
  }],
  paths: {
    jquery: '/jquery/jquery.min',
    underscore: '/underscore-amd/underscore-min'
  }
});

require(
    ['jquery', 'domkit/controllers/radiogroup', 'domkit/ui/button',
     'domkit/ui/palette'],
    function ($, RadioGroup, Button, Palette) {
  $(function () {
    window.RadioGroup = RadioGroup;
    window.Button = Button;
    window.Palette = Palette;
  });
});
