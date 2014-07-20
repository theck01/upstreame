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


require(['jquery', 'pixeleditor/pixeleditor'], function ($, PixelEditor) {
  $(function () {
    window.app = new PixelEditor();
  });
});
