var router = new geddy.RegExpRouter();

// DASHBOARDS
router.get(    '/dashboard')              .to('Dashboards.main');
router.get(    '/dashboard/install')      .to('Dashboards.install');
router.post(   '/dashboard/finish')       .to('Dashboards.finish');
router.get(    '/dashboard/analytics')    .to('Dashboards.analytics');

// LOGIN
router.get(    '/dashboard/login')        .to('Dashboards.login');
router.get(    '/dashboard/logout')       .to('Dashboards.logout');
router.post(   '/dashboard/authenticate') .to('Dashboards.authenticate');

// POSTS
router.get(    '/dashboard/post')         .to('Posts.add');
router.post(   '/dashboard/post')         .to('Posts.create');
router.get(    '/dashboard/post/:slug')   .to('Posts.edit');
router.put(    '/dashboard/post/:slug')   .to('Posts.update');
router.del(    '/dashboard/post/:id')     .to('Posts.remove');

// PUBLIC POSTS
router.get(    '/posts.json')             .to('Posts.list');
router.get(    '/:slug(.:format)')                  .to('Posts.show');
router.get(    '/')                       .to('Main.index');

exports.router = router;
