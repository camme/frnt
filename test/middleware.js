/**
    Tests for the server itself.
*/

var bServer = require('./test-backend-server');
var express = require('express');
var should = require('should');
var path = require('path');
var request = require('request');
var frontender = require('../index');
var fs = require("fs");
var http = require("http");

describe("The middleware default functions:", function() {

    before(function(done) {

        var self = this;

        bServer.start(function() {

            var app = self.fApp = express();

            app.use(app.router);
            app.use(frontender.init({
                proxyUrl: "http://localhost:3000"
            }));

            // define rendering engine
            app.set('views', path.join(__dirname, "views"));
            app.set('view options', { layout: false });
            app.set('view engine', 'html' );
            app.engine('html', require('express-dot').__express );

            self.fServer = require('http').createServer(app);
            self.fServer.listen(3010, function setupBackend() {
                done();
            });

        });

    });

    after(function(done) {
        var self = this;
        bServer.close(function() {
            self.fServer.close(done);
        });
    });

    it("Proxy all incomming requests", function(done) {

        request.get("http://localhost:3010/enemies", function(err, req, body) {
            body.should.equal("borg,ferengi");
            done();
        });

    });

    it("Dont proxy something that is defined as a route", function(done) {

        this.fApp.get("/weapons", function(req, res) {
            res.send("phasers");
        });

        request.get("http://localhost:3010/weapons", function(err, req, body) {
            body.should.equal("phasers");
            done();
        });

    });

    it("Render a result with the correct template if 'template' is defined in the answer", function(done) {

        request.get("http://localhost:3010/starships", function(err, req, body) {
            body.should.contain("<li>enterprise</li>");
            body.should.contain("<li>enterprise-a</li>");
            done();
        });

    });



});



