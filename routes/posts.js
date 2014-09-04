// A collection of posts routes, bound to the given PostArchive instance.
//
// Arguments:
//     postArchive: An initialized instance of a PostArchive.
var PostRoutes = function (postArchive) {
  var routes = Object.create(null);
  routes.all = PostRoutes.all.bind(null, postArchive);
  routes.getPost = PostRoutes.getPost.bind(null, postArchive);
  routes.getPostsByAuthor = PostRoutes.getPostsByAuthor.bind(null, postArchive);
  routes.getPostsByCategory =
      PostRoutes.getPostsByCategory.bind(null, postArchive);
  routes.lastPost = PostRoutes.lastPost.bind(null, postArchive);
  return routes;
};


// Render the titles of all posts to the postlist view
PostRoutes.all = function (postArchive, req, res) {
  var opts = {
    title: 'upstrea.me',
    main: '/scripts/blog/main.js',
    posts: postArchive.getAll()
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = '/scripts/dist/blog.min.js';
  }

  res.render('postlist', opts);
};


// Render the post with the given urlTitle to the post view.
PostRoutes.getPost = function (postArchive, req, res) {
  var postUrlTitle = req.params.title;
  var opts = {
    title: 'upstrea.me',
    main: '/scripts/blog/main.js',
    post: postArchive.byUrlTitle(postUrlTitle)
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = '/scripts/dist/blog.min.js';
  }

  res.render('post', opts);
};


// Render the posts with the given author to the postlist view.
PostRoutes.getPostsByAuthor = function (postArchive, req, res) {
  var postAuthor = req.params.author;
  var opts = {
    title: 'upstrea.me',
    main: '/scripts/blog/main.js',
    posts: postArchive.byAuthor(postAuthor)
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = '/scripts/dist/blog.min.js';
  }

  res.render('postlist', opts);
};


// Render the posts with the given category to the postlist view.
PostRoutes.getPostsByCategory = function (postArchive, req, res) {
  var postCategory = req.params.category;
  var opts = {
    title: 'upstrea.me',
    main: '/scripts/blog/main.js',
    posts: postArchive.byCategory(postCategory)
  };

  if (process.env.NODE_ENV === 'production') {
    opts.main = '/scripts/dist/blog.min.js';
  }

  res.render('postlist', opts);
};


// Render the last post to the post view.
PostRoutes.lastPost = function (postArchive, req, res) {
  res.redirect('/posts/' + postArchive.getMostRecent().urlTitle);
};


module.exports = PostRoutes;
