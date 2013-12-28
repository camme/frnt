
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

        if (typeof options.filter == "function") {
            body = options.filter(body);
        }

        if (proxyRes.statusCode === 200 && proxyRes.headers['content-type'] == "application/json") {

            try {

                var data = JSON.parse(body.toString());

                cache[req.path] = data;

                if (typeof data.template == "string") {

                    if (options.layout === false) {
                        data.layout = false;
                    }

                    res.render(data.template, data, function(err, html) {
                        if (err) {
                            res.status = 500;
                            res.write(JSON.stringify(err));
                            console.log(err, html);
                        } else {
                            res.write(html);
                        }
                        res.end();
                    });
                }

            } catch (err) {
                console.log(err);
                res.write(JSON.stringify(err));
                res.end();
            }

        } else {

            res.status(proxyRes.statusCode);
            res.write(proxyRes.statusCode.toString());
            res.write("error");
            res.write(body);
            res.end();

        }

    });


}
