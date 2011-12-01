var reed = require('reed')
  , helpers = require("../helpers")
  , config = require("../config");

// Start listening for posts in the posts directory
reed.open("./posts");

/*
 * GET home page.
 */

exports.index = function(req, res){
  // Set up an array to store our posts in
  var posts = []
  // Figure out what page we're on
  , page = parseInt(req.param('page')) || 1
  // Alias the posts per page config option
  , limit = config.postsPerPage
  // Set up a place to tell the view
  // whether or not there will be more pages
  , more
  // Gotta store the total number of pages somewhere
  , totalPosts;

  /**
   * getPost
   * Gets a post from reed, adds it to the post array,
   * and if there are enough posts to render the page, do so.
   * @param  {String} title : the title of the post to get
   * @return {Boolean}
   */
  var getPost = function(title) {

    // if we don't get a title, fail softly
    if (typeof title == 'undefined') return false;

    // get the post from reed
    reed.get(title, function(err, metadata, htmlContent){

      // fail softly if there's an err
      // TODO: handle this better
      if (err) return false;

      // If theres more than one page of content, truncate the post
      if (page == 1 && !more) {
        var content = htmlContent;
      }

      // Otherwise, lets just show the whole thing
      else {
        var content = helpers.truncateHTML(htmlContent, 400, '<a href="/posts/'+title.replace(" ","-")+'">Read More &raquo;</a>')
      }

      // Push the post into our posts array
      posts.push({
        title: metadata.title || "Untitled"
      , slug: title.replace(" ","-")
      , updatedAt: helpers.humaneDate(metadata.lastModified)
      , author: config.author
      , metadata: metadata
      , content: content
      });

      // If we have enough posts to render the page, do so
      if (posts.length == limit) {
        res.render('index', {
          siteTitle: config.blogTitle
        , siteSubTitle: config.blogSubTitle
        , posts: posts
        , author: config.author
        , more: more
        , less: !!(page > 1)
        , totalPosts: totalPosts
        , nextPage: (page > 1) ? page+1 : 2
        , previousPage: (page > 1) ? page-1 : 1
        })
      }

    });

  }

  // Grab a list of all the posts
  reed.list(function(err, titles){

    // Keep track of the total number of posts
    totalPosts = titles.length;

    // Do we have more posts after this page?
    more = !!((titles.length - ((limit * page) - limit)) > limit);

    // This isn't last page
    if (titles.length > limit * page) {
      titles.splice(0, (limit * page) - limit)
    }

    // this is the last page
    else {
      titles.splice(0, (limit * page) - limit)
      limit = titles.length
    }

    // Lets get the content and metadata for the posts on this page
    for (var i = 0; i < limit; i++) {
      getPost(titles[i]);
    }

  });

};

exports.show = function(req, res){
  reed.get(req.params.post, function(err, metadata, htmlContent) {
    //In a real scenario, you should use a view
    //and make use of the metadata object.
    if (err) {
      res.send('There was an error: ' + JSON.stringify(err));
    }
    else {
      res.render('show', {
        siteTitle: config.blogTitle
      , title: metadata.title || "Untitled"
      , slug: req.params.post
      , subTitle: metadata.subtitle
      , author: config.author
      , updatedAt: helpers.humaneDate(metadata.lastModified)
      , content: htmlContent
      });
    }
  });
}
