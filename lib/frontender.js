var request = require("request");
var cache = require('./cache');

exports.init = function(options) {

    options = options || {};
    options.process = typeof options.process == "function" ? options.process : function(data, next) { next(null, data); };

    function middleware(req, res, next) {

        if (typeof options.firstPackage === 'string') {

            res.setHeader('content-type', "text/html");

            var data = cache.get(req.path).value;
            data = data || {};
            var layout = data.layout;
            data.layout = false;

            res.render(options.firstPackage, data, function(err, html) {
                data.layout = layout;
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

    var cachedData = cache.get(req.path);
    var rendered = false;

    if (cachedData.value) {
        rendered = true;
        render(options, res, cachedData.value);
    }

    if (cachedData.outdated) {

        proxyRequestFn(options.proxyUrl + req.path, function(err, proxyRes, body) {

            if (typeof options.filter == "function") {
                body = options.filter(body.toString());
            }
            if (proxyRes.statusCode === 200 && proxyRes.headers['content-type'] == "application/json") {


                var data = {};

                try {
                    data = JSON.parse(body.toString());
                } catch (err) {
                    console.log("ERR", err, body.toString());
                }

                options.process(data, function(err, data) {

                    if (typeof data.template == "string") {
                        if (options.layout === false) {
                            data.layout = false;
                        }
                    }

                    cache.set(req.path, data);

                    if (!rendered) {
                        render(options, res, data);
                    }


                });


            } else {

                //res.status(proxyRes.statusCode);
                res.write(proxyRes.statusCode.toString());
                res.write("error");
                res.write(body);
                res.end();
                console.log("ERR", proxyRes.statusCode, body.toString());

            }

        });

    }


}

function render(options, res, data) {
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
