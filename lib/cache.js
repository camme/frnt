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
    //maxAge: 1000 * 2
    //60 * 60 * 5
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

// this is used so we can keep a copy of the latest cached data. by doing so, we make sure that we can responde
// with data, even if the data is outdated
var cachedCache = {};

exports.set = function(key, group, data) {
   if (arguments.length == 2) {
        data = group;
        delete group;
    } else {
        groups[group] = key;
    }

    // save acopy locally. TODO: We need to clean this up somehow
    cachedCache[key] = data;
    cache.set(key, data);
}

exports.get = function(key) {
    var peekValue = cachedCache[key];
    var nowValue = cache.get(key);
    var result =  {
        outdated: !nowValue,
        value: nowValue ? nowValue : peekValue
    }
    return result;
}

