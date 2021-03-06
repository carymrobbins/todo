Todo - A simple web app written with Scala and Play
=================================

Dependencies
-------

* Java JDK 6 (minimum)
* Bower (http://bower.io/)

Running the app
-------

1. From a terminal, `cd` to the cloned directory.
1. Install the bower dependencies using `bower install`
1. Now you can run the development server using `./activator run`.  This will download all the needed dependencies for building and running the application.

You should eventually see a message like this -

```[info] play - Listening for HTTP on /0:0:0:0:0:0:0:0:9000```

At this point you can navigate to `localhost:9000` in your browser.

Persistence
-------

The current implementation uses an in-memory H2 database.  This means that data **will not** persist between
restarts of the application.

Upon each run of the application you will be notified that `Database 'default' needs evolution!`.  Click the
`Apply this script now!` button to create the appropriate database schema.
