var request = require("request");
var cache = require('./cache');

exports.init = function(options) {

    options = options || {};
    options.process = typeof options.process == "function" ? options.process : function(data, next) { next(null, data); };

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

    console.log("\n----------");
    console.log("Get cache for", req.path);
    if (cache.valid(req.path)) {
        var cachedData = cache.get(req.path);
        console.log("CACHED");
        render(options, res, cachedData);
        return;
    }

    proxyRequestFn(options.proxyUrl + req.path, function(err, proxyRes, body) {

        if (typeof options.filter == "function") {
            body = options.filter(body.toString());
        }

        if (proxyRes.statusCode === 200 && proxyRes.headers['content-type'] == "application/json") {

            try {

                var data = JSON.parse(body.toString());

                options.process(data, function(err, data) {


                    if (typeof data.template == "string") {

                        if (options.layout === false) {
                            data.layout = false;
                        }

                    }

                    console.log("Save cache for", req.path);
                    cache.set(req.path, data);

                    render(options, res, data);


                });

            } catch (err) {
                console.log("Error when converting json to json", err, body);
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