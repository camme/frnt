const frnt = require('../');
const fs = require("fs");
const path = require("path");
const express = require('express');
const app = express();
const doT = require('express-dot');

const port = process.env.PORT || 8080;

// The link to your wordpress site
const contentUrl = process.env.CONTENT_URL || 'http://localhost:8081';

// Define where the public files are, in this example ./public
app.use(express.static(path.join(__dirname, 'public')));

// Setup the frnt middleware with the link to the internal server
app.use(frnt.init({
    proxyUrl: contentUrl,
    logLevel: 'verbose'
}));

// define rendering engine
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'html' );
app.engine('html', doT.__express );

app.listen(port, err => {
    if (err) {
        console.log('Error, could not start:', err);
        process.exit(1);
    }
    console.log('\nStarted server on http://localhost:%s\n', port);
}); 
