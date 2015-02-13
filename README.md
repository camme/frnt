frnt
==========

Front-end server for your website.

Super simple to setup:

    var path = require('path');
    var frnt = require('frnt');
    var express = require('express');
    var app = express();
    
    // template engine, can be whatever you like
    var doT = require('express-dot');
    
    // make sure that your routes are set before the frnt middleware
    app.use(app.router);
    
    // here is where we set up the middleware
    app.use(frnt.init({
        proxyUrl: "http://localhost:8080" // this is the internal URL for the data
    }));
    
    // define rendering engine
    app.set('views', path.join(__dirname, "views"));
    app.set('view engine', 'html' );
    app.engine('html', doT.__express );
    
    app.listen(3000);
    
