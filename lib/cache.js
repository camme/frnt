var lruCache = require('lru-cache');

var options = {
    max:500,
    length:function(n) {
        return n * 2
    },
    dispose:function(key, n) {
        //console.log('Disposing cache for', key);
    },
    maxAge: 60 * 60 * 5
}

var cache = lruCache(options);

exports.middleware = function(req, res, next) {

    var itemKey = req.path;

    console.log(res.body);

    if( req.method == 'GET' ) {
        if( !cache.has(itemKey) ) {

            if( res._body && res.statusCode == 200 ) {
                var cachedValue = res._body;
                cache.set(itemKey, cachedValue);
                console.log("SAVE", itemKey);
            }
        }
    } else {
        if( cache.has(itemKey) ) {
            cache.del(itemKey);
        }
    }

    next();

};

// Decorate the cache module
exports.valid = function(key) {
    var valid = false;
    if (cache.has(key)) {
        var result = cache.get(key);
        if (result) {
            valid = true;
        }
    }
    return valid;
}

exports.cache = cache;

var groups = {};

exports.set = function(key, group, data) {
    if (arguments.length == 2) {
        data = group;
        delete group;
    } else {
        groups[group] = key;
    }
    cache.set(key, data);
}

exports.get = function(key) {
    var peekValue = cache.peek(key);
    var nowValue = cache.get(key);
    peekValue = peekValue || nowValue;
    var result =  {
        value: peekValue,
        outdated: peekValue == nowValue
    }
    console.log(result);
    return result;
}

