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

describe("The middlewares first package functions:", function() {

    before(function(done) {

        var self = this;

        bServer.start(function() {

            var app = self.fApp = express();

            app.use(app.router);
            app.use(frontender.init({
                proxyUrl: "http://localhost:3000",
                firstPackage: "firstpackage"
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

    it("Test the first package option", function(done) {

        var options = { hostname: "localhost", port: 3010, path: '/test-first-package', method: 'GET' };

        var firstChunk = true;
        var body = "";

        var req = http.request(options, function(res) {

            var headersString = "";
            for (var key in res.headers) {
                headersString += key + ":" + res.headers[key] + "\r\n";
            }
            res.on('data', function (chunkData) {
                var chunk = chunkData.toString();
                body += chunk;
                if (firstChunk) {
                    chunk.should.contain("first package");
                    chunk.should.not.contain("Rest of");
                    firstChunk = false;
                }
            });
            res.on("end", function() {
                body.should.contain("Rest of");
                done();
            });
        });

        req.end();

    });



});



