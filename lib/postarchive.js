var jfm = require('json-front-matter');
var marked = require('marked');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');


// PostArchive object encapsulates all post objects in a blog.
//
// Argument:
//     directory: String, the directory where posts are stored.
var PostArchive = function (directory) {
  this._directory = directory;

  // Posts, sorted by date.
  this._posts = [];

  // Maps from various metadata to posts.
  this._postsByUrlTitle = Object.create(null);
  this._postsByAuthor = Object.create(null);
  this._postsByCategory = Object.create(null);

  this._loadPostDirectory();
};


// byAuthor returns an array of post objects retrieved by author
//
// Arguments:
//     postAuthor: String, the author of a post.
// Returns an array of objects, each with the following fields:
//     title: The post title.
//     urlTitle: The title used in the url.
//     author: The post author.
//     date: The post date.
//     category: The post category.
//     content: The posts content.
PostArchive.prototype.byAuthor = function (postAuthor) {
  if (!this._postsByAuthor[postAuthor]) {
    throw Error(
        'Cannot find previews for posts with given author: ' + postAuthor);
  }
  return this._postsByAuthor[postAuthor];
};


// byCategory returns an array of post objects retrieved by category.
//
// Arguments:
//     postCategory: String, the category of a post.
// Returns an array of objects, each with the following fields:
//     title: The post title.
//     urlTitle: The title used in the url.
//     author: The post author.
//     date: The post date.
//     category: The post category.
//     content: The posts content.
PostArchive.prototype.byCategory = function (postCategory) {
  if (!this._postsByCategory[postCategory]) {
    throw Error(
        'Cannot find previews for posts with given category: ' + postCategory);
  }
  return this._postsByCategory[postCategory];
};


// byTitle returns a post object retrieved by title.
//
// Arguments:
//     urlTitle: String, the url title of a post.
// Returns an object with the following fields:
//     title: The post title.
//     urlTitle: The title used in the url.
//     author: The post author.
//     date: The post date.
//     category: The post category.
//     content: The posts content.
PostArchive.prototype.byUrlTitle = function (urlTitle) {
  if (!this._postsByUrlTitle[urlTitle]) {
    throw Error('Cannot find post with given title: ' + urlTitle);
  }
  return this._postsByUrlTitle[urlTitle];
};


// getAll returns all posts sorted from most recent to least.
//
// Returns an array of objects sorted by date, each with the following fields:
//     title: The post title.
//     urlTitle: The title used in the url.
//     author: The post author.
//     date: The post date.
//     category: The post category.
//     content: The posts content.
PostArchive.prototype.getAll = function () {
  return this._posts;
};


// getMostRecent returns the most recent post.
//
// Returns an object with the following fields:
//     title: The post title.
//     urlTitle: The title used in the url.
//     author: The post author.
//     date: The post date.
//     category: The post category.
//     content: The posts content.
PostArchive.prototype.getMostRecent = function () {
  return this._posts[0];
};


// _getPostSortedPosition returns the position where the post is located
// within the array if the post exists, or where the post should be inserted
// if the post does not exist.
//
// Argument:
//     post: An object with the fields
//         title: The post title.
//         urlTitle: The title used in the url.
//         author: The post author.
//         date: The post date.
//         category: The post category.
//         content: The posts content.
//     array: The array in which to find the post's sorted position.
PostArchive.prototype._getPostSortedPosition = function (post, array) {
  return _.sortedIndex(array, post, function (p) {
    // Construct a date from the post date and return the negative time since
    // the epoch, so that most recent posts appear first within the array.
    var date = new Date(p.date);
    return -date.getTime();
  });
};


// _loadPost loads a single post at the given path into the archive.
//
// Arguments:
//     postData: Object with 'attributes' and 'body' fields.
PostArchive.prototype._loadPost = function (postData) {
  var post = postData.attributes;
  post.content = postData.body;
  post.htmlContent = marked(post.content);
  post = this._sanitizePost(post);

  // If the post already exists in the archive then remove it from the
  // archive before adding it again.
  if (this._postsByUrlTitle[post.urlTitle]) {
    this._removePostByUrlTitle(post.urlTitle);
  }

  var overallPosition = this._getPostSortedPosition(
      post, this._posts);
  this._posts.splice(overallPosition, 0, post);

  this._postsByUrlTitle[post.urlTitle] = post;

  this._postsByAuthor[post.author] =
      this._postsByAuthor[post.author] || [];
  var authorPosition = this._getPostSortedPosition(
      post, this._postsByAuthor[post.author]);
  this._postsByAuthor[post.author].splice(authorPosition, 0, post);

  this._postsByCategory[post.category] =
      this._postsByCategory[post.category] || [];
  var categoryPosition = this._getPostSortedPosition(
      post, this._postsByCategory[post.category]);
  this._postsByCategory[post.category].splice(categoryPosition, 0, post);
};


// loadPostDebugDebug public alias to _loadPost, for testing purposes only.


// _loadPostDirectory loads all posts in the posts directory into the archive.
PostArchive.prototype._loadPostDirectory = function () {
  var archive = this;
  fs.readdir(this._directory, function (err, files) {
    _.each(files, function (f) {
      // Only load '.md' files
      if (path.extname(f) !== '.md') return;
      var filePath = path.join(archive._directory, f);
      jfm.parseFile(filePath, function (err, data) {
        if (err) throw Error(err);
        archive._loadPost(data);
      });
    });
  });
};


// _removePostByUrlTitle removes a post from the post archive using a url
// title.
//
// Arguments:
//     urlTitle: String, The url title of the post to remove.
PostArchive.prototype._removePostByUrlTitle = function (urlTitle) {
  var post = this._postsByUrlTitle[urlTitle];
  if (!post) throw Error('Cannot remove non-existant post.');

  var overallPosition = this._getPostSortedPosition(
      post, this._posts);
  this._posts.splice(overallPosition, 1);

  delete this._postsByUrlTitle[urlTitle];

  var authorPosition = this._getPostSortedPosition(
      post, this._postsByAuthor[post.author]);
  this._postsByAuthor[post.author].splice(authorPosition, 1);

  var categoryPosition = this._getPostSortedPosition(
      post, this._postsByCategory[post.category]);
  this._postsByCategory[post.category].splice(categoryPosition, 1);
};


// _sanitizePost ensures that post objects have a correct formula
//
// Argument:
//     post: An object with the fields
//         title: The post title.
//         urlTitle: The title used in the url.
//         author: The post author.
//         date: The post date.
//         category: The post category.
//         content: The posts content.
// Returns the post object with fields sanitized.
PostArchive.prototype._sanitizePost = function (post) {
  var errStr = '';
  if (!post.title) errStr += 'Post must have a title.\n';
  if (!post.urlTitle) errStr += 'Post must have a url title.\n';
  if (!post.author) errStr += 'Posts must have an author.\n';
  if (!post.category) errStr += 'Posts must have a category.\n';
  if (!post.content) errStr += 'Posts must have content.\n';
  if (!post.htmlContent) errStr += 'Posts must have generated HTML content.\n';
  if (!post.date) errStr += 'Posts must have a date.\n';
  else {
    var date = new Date(post.date);
    if (!date.getTime || isNaN(date.getTime())) {
      errStr += 'Posts must have a validily formatted date.\n';
    }
  }

  if (errStr.length !== 0) {
    throw Error(errStr + JSON.stringify(post));
  }

  return _.pick(
      post, 'title', 'urlTitle', 'author', 'category', 'content', 'htmlContent',
      'date');
};


module.exports = PostArchive;
