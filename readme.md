#Scotch
###A really classy, dead simple, markdown based, blogging framework for node.js

To try Scotch for yourself, make sure that you have node, npm, geddy (`npm install -g geddy`), and mongodb installed (and running), then do this:

    $> npm install -g scotch-blog
    $> scotch create blog
    $> cd blog
    $> sudo scotch serve

Go to http://0.0.0.0/dashboard/install to install Scotch.

Your blog should be up and running on http://localhost

### Static Site Generation

    $> cd blog
    $> scotch generate
    
Your you should now have a 'static' directory in your blog's root directory.

#### Dashboard

![Scotch's dashboard](https://dl.dropbox.com/u/7982297/scotch_screens/newdash.png)


#### Writing

![writing in Scotch](https://dl.dropbox.com/u/7982297/scotch_screens/newwrite.png)


#### Reading

![writing in Scotch](https://dl.dropbox.com/u/7982297/scotch_screens/newread.png)


### Things to Do

If you'd like to help out, check out the [issue list](https://github.com/Techwraith/scotch/issues?state=open).
