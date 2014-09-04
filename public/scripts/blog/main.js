require.config({
  baseUrl: '/scripts',
  paths: {
    jquery: '/jquery/jquery.min',
    underscore: '/underscore-amd/underscore-min'
  }
});

require(['jquery', 'blog/blog'], function ($, Blog) {
  // Retrive the logo sprite immediately, as the AJAX request is not dependent
  // upon the document being ready.
  window.blog = new Blog();
  window.blog.retrieveLogo('splash-screen');
  
  $(function () {
    window.blog.init('#logo-canvas');
  });
});
