(function () {
  var assert = require('assert')
  , path = require('path')
  , init = require(path.join('../','init'))
  , Post = geddy.model.Post;
  
  /*
  * The actual tests
  */
  tests = {
    'test default post': function (next) {
      var newPost = Post.create().toObj();
      assert.ok(newPost.createdAt,'createdAt is present');
      assert.strictEqual(newPost.title, 'Untitled Post', 'Default title is correct');
      assert.strictEqual(newPost.slug, 'untitled-post', 'Slug is correct');
      assert.strictEqual(newPost.markdown, '**Draft**', 'Markdown is correct');
      assert.strictEqual(newPost.html, '<p><strong>Draft</strong></p>\n', 'HTML is correct');
      assert.strictEqual(newPost.isPublished, false, 'Post is not published');
      
      next();
    }
  , 'test new post fails validation': function (next) {
      var newPost = Post.create();
      
      //Save post
      newPost.save(function (err) {
        assert.deepEqual(err, {title: '"title" is required.'}, 'Post should require a title');
        
        next();
      });
    }
  , 'test save new draft post': function (next) {
      var title = 'A Test Draft'
        , slug = 'a-test-draft'
        , md = 'Peter **piper** flicked a sack of nimble hecklers.'
        , html = '<p>Peter <strong>piper</strong> flicked a sack of nimble hecklers.</p>\n'
        , newPost = Post.create({
          title:title
        , markdown:md
        });
      
      //Save post
      newPost.save(function (err) {
        assert.strictEqual(err, null, err);
        assert.ok(newPost.id, 'ID was assigned');
        
        //Get Post
        Post.all({id: newPost.id}, function(err, posts) {
          var newPost = posts[0];
          
          assert.strictEqual(err, null, err);
          assert.strictEqual(1, posts.length, 'There should only exactly one post with this id');
          assert.ok(newPost.createdAt,'createdAt is present');
          assert.strictEqual(newPost.title, title, 'Default title is correct');
          assert.strictEqual(newPost.slug, slug, 'Slug is correct');
          assert.strictEqual(newPost.markdown, md, 'Markdown is correct');
          assert.strictEqual(newPost.html, html, 'HTML is correct');
          assert.strictEqual(newPost.isPublished, false, 'Post is not published by default');
          
          next();
        });
      });
    }
  , 'test save new published post': function (next) {
      var title = 'A Test Post'
        , slug = 'a-test-post'
        , md = 'Peter **piper** kept a cat in crinkled crackers.'
        , html = '<p>Peter <strong>piper</strong> kept a cat in crinkled crackers.</p>\n'
        , newPost = Post.create({
          title:title
        , markdown:md
        , isPublished: true
        });
      
      //Save post
      newPost.save(function (err) {
        assert.strictEqual(err, null, err);
        assert.ok(newPost.id, 'ID was assigned');
        
        //Get Post
        Post.all({id: newPost.id}, function(err, posts) {
          var newPost = posts[0];
          
          assert.strictEqual(err, null, err);
          assert.strictEqual(1, posts.length, 'There should only exactly one post with this id');
          assert.ok(newPost.createdAt,'createdAt is present');
          assert.strictEqual(newPost.title, title, 'Default title is correct');
          assert.strictEqual(newPost.slug, slug, 'Slug is correct');
          assert.strictEqual(newPost.markdown, md, 'Markdown is correct');
          assert.strictEqual(newPost.html, html, 'HTML is correct');
          assert.strictEqual(newPost.isPublished, true, 'Post is published');
          
          next();
        });
      });
    }
  , 'test fetch post by slug': function (next) {
      var title = 'A Test Post'
        , slug = 'a-test-post'
        , md = 'Peter **piper** snuck a rat in teacher\'s knickers.'
        , html = '<p>Peter <strong>piper</strong> snuck a rat in teacher&#39;s knickers.</p>\n'
        , newPost = Post.create({
          title:title
        , markdown:md
        , isPublished: true
        });
      
      //Save post
      newPost.save(function (err) {
        assert.strictEqual(err, null, err);
        assert.ok(newPost.id, 'ID was assigned');
        
        //Get Post
        Post.all({slug: newPost.slug}, function(err, posts) {
          var newPost = posts[0];
          
          assert.strictEqual(err, null, err);
          
          assert.strictEqual(1, posts.length, 'There should only exactly one post with this id');
          assert.ok(newPost.createdAt,'createdAt is present');
          assert.strictEqual(newPost.title, title, 'Default title is correct');
          assert.strictEqual(newPost.slug, slug, 'Slug is correct');
          assert.strictEqual(newPost.markdown, md, 'Markdown is correct');
          assert.strictEqual(newPost.html, html, 'HTML is correct');
          assert.strictEqual(newPost.isPublished, true, 'Post is published');
          
          next();
        });
      });
    }
  };
  
  module.exports = init.proxyModelTests('Post', tests);
}());
