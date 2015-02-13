frnt
==========

Front-end server for your website, in nodejs.

### Install

    npm install frnt

Super simple to setup:

    var path = require('path');
    var frnt = require('frnt'); / Loadit 
    var express = require('express');
    var app = express();
    
    // template engine, can be whatever you like. 
    var doT = require('express-dot');
    
    // make sure that your routes are set before the frnt middleware
    app.use(app.router);
    
    // here is where we set up the middleware
    app.use(frnt.init({
    
        // this is the internal URL for the data.
        // so each call to your site, say www.foo.com/hello
        // will be proxied to the address below, which in the foo example would be
        // http://localhost:8080/hello
        // As long as http://localhost:8080/hello returns json, say:
        // { 
        //     title: 'hello world'
        //     module: 'index'
        // }
        // It will be merged with your template (which corresponds with the name given in 'module'
        proxyUrl: "http://localhost:8080" 
    }));
    
    // define rendering engine
    app.set('views', path.join(__dirname, "views"));
    app.set('view engine', 'html' );
    app.engine('html', doT.__express );
    
    app.listen(3000);
    
