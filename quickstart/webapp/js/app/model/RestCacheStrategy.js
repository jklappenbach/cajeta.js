define([
    'cajeta'
], function(Cajeta) {

    /**
     *
     *
     */
    Cajeta.Cache.RestCacheStrategy = Cajeta.Cache.AbstractCacheStrategy.extend({
        initialize: function(properties) {
            var self = properties.self === undefined ? properties.self : this;
            self.super.initialize.call(this, properties.cacheId);
        },

        url: 'http://localhost:8080/cache/',

        ajax: new Cajeta.Ajax({
            'header' : {
                'Accept' : "application/json; charset=UTF-8",
                'Content-Type' : "application/x-www-form-urlencoded; charset=UTF-8"
            },
            'encoding' : 'application/json'
        }),
        /**
         * First, attempt to use cookies.  If they're not available, go to an in-memory store
         * The former is more desirable as in-memory is flushed for every url change.
         *
         * @param key The key of the entry to store in cache.
         * @param value The value of the entry to store in cache.
         */
        put: function(key, value) {
            // Make sure that a ":" isn't in the key, which would cause issues for document name parsing.
            if (key.indexOf(':') >= 0)
                throw 'The ":" character is not allowed in cache key values.';

            if (this.cache === undefined) {
                jCookies.set(this.cacheId + ':' + key, value);
            } else {
                this.cache[this.cacheId + ':' + key] = value;
            }
        },
        get: function(key) {
            if (this.cache === undefined)
                return jCookies.get(this.cacheId + ':' + key);
            else
                return this.cache[this.cacheId + ':'  + key];
        },
        del: function(pattern) {
            if (this.cache === undefined) {
                var cookies = jCookies.filter(pattern);
                for (var name in cookies) {
                    if (name !== undefined) {
                        jCookies.del(name);
                    }
                }
            } else {
                // Include the ':' in the pattern, reducing the chance of false positives.
                pattern = (pattern.indexOf(':') >= 0) ? pattern : pattern + ':';
                var regExp = new RegExp(pattern);
                for (var name in this.cache) {
                    if (name !== undefined && name.match(regExp)) {
                        delete this.cache.name;
                    }
                }
            }
        }
    });

    return homePage;
});