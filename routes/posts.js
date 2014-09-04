// A collection of posts routes, bound to the given PostArchive instance.
//
// Arguments:
//     postArchive: An initialized instance of a PostArchive.
var PostRoutes = function (postArchive) {
  var routes = Object.create(null);
  routes.lastPost = PostRoutes.lastPost.bind(null, postArchive);
  return routes;
};


// Render the last post to the blog view.
PostRoutes.lastPost = function (postArchive, req, res) {
  var opts = {
    title: 'upstrea.me',
    main: 'scripts/blog/main.js',
    post: postArchive.getMostRecent()
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = 'scripts/dist/blog.min.js';
  }

  res.render('blog', opts);
};


module.exports = PostRoutes;
