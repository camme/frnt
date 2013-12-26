
var request = require("request");

var cache = {};

exports.init = function(options) {

    options = options || {};


    function middleware(req, res, next) {

        if (typeof options.firstPackage === 'string') {

            var data = cache[req.path];
            data = data || {};
            data.layout = false;
            res.render(options.firstPackage, data, function(err, html) {
                res.write(html);
                renderPage(req, res, options);
            });

        } else {


            renderPage(req, res, options);

        }


    };

    return middleware;

};

function renderPage(req, res, options) {

    var proxyRequestFn = request[req.method.toLowerCase()];

    var internalUrl = options.proxyUrl + req.path;

    proxyRequestFn(options.proxyUrl + req.path, function(err, proxyRes, body) {

        if (proxyRes.headers['content-type'] == "application/json") {

            try {

                var data = JSON.parse(body);

                cache[req.path] = data;

                if (typeof data.template == "string") {
                    data.layout = false; //data.template + ".html";
                    res.render(data.template, data, function(err, html) {
                        res.write(html);
                        res.end();
                    });
                }

            } catch (err) {
                res.send(err);
            }

        } else {
            res.send(body);
        }

    });


}
