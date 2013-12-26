var express = require('express');
var app = express();
var server = require('http').createServer(app);

app.get("/enemies", function(req, res) {
    res.send("borg,ferengi");
});

app.get("/starships", function(req, res) {
    res.setHeader('content-type', 'application/json');
    res.send({list: ["enterprise", "enterprise-a"], template: "list-starships"});
});

app.get("/test-first-package", function(req, res) {
    res.setHeader('content-type', 'application/json');
    res.send({list: ["enterprise", "enterprise-a"], template: "restofbody"});
});

exports.start = function(next) {
    server.listen(3000, next);
};

exports.close = function(next) {
    server.close(next);
};

exports.app = app;
