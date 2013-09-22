/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 3:57 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'cajetaCore',
    'jcookies'
], function($, Cajeta, jCookies) {
    Cajeta.Datasource = {
        cache: {},
        set: function(datasource) {
            this.cache[datasource.getId()] = datasource;
        },
        get: function(datasourceId) {
            return this.cache[datasourceId];
        }

    };
    /**
     * AbstractRestDS provides an abstract, REST based API definition for datasources.  For the default datasource
     * interface, REST was chosen as the protocol can easily be abstracted to just about any other, and it natively
     * supports the main dialect supported by most HTTP based APIs.
     *
     * All methods support a "properties" argument, which supports multiple, optional arguments.  The following are
     * parsed for all methods:
     *
     * templateValues:  Values meant to be used on the uriTemplate to create a uri
     * uriTemplate:     Will replace a uriTemplate established in the constructor for the invocation
     * async:           Indicates the method should be executed asynchronously, returning a requestId instead of the
     *                  requested data
     * requestId:       If omitted, asynchronous calls will return the uri for the request. Otherwise, this value will
     *                  be presented in the callback
     *
     * @type {*}
     */
    Cajeta.Datasource.AbstractRestDS = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw 'Cajeta.Datasource.AbstractRestDS.id must be defined';
        },

        getId: function() {
            return this.id;
        },

        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onComplete.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @abstract
         * @access public
         * @param parameters (optional) An object containing uriTemplate values, uriTemplate, or a requestId for the operations
         * @returns The requestId, which is either the the provided requestId, or the generated uri if the id is omitted.
         */
        get: function(parameters) {
            throw 'Error: A call was made to an abstract method.  ' +
                'You must provide an override for a valid object definition';
        },

        /**
         * Returns a boolean to indicate whether or not the method was
         * executed sucessfully.  If no parameters are provided, the method should assume that
         * this.uriTemplate is a member property, and any parameters are to be derived from the
         * application modelCache.
         *
         * @abstract
         * @access public
         * @param data The data to put into the uri
         * @param parameters (optional) An object containing uriTemplate values, uriTemplate, or a requestId for the operations
         */
        put: function(data, parameters) {
            throw 'Error: A call was made to an abstract method.  You must provide an override ' +
                'for a valid object definition';
        },
        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onComplete.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @abstract
         * @access public
         * @param data The data to post to the uri
         * @param parameters (optional) An object containing uriTemplate values, uriTemplate, or a requestId for the operations
         */
        post: function(data, parameters) {
            throw 'Error: A call was made to an abstract method.  You must provide an override ' +
                'for a valid object definition';

        },

        /**
         * Delete the resource identified by a uri.  If no parameters are provided, the method should assume that
         * the uriTemplate is a member property, and any parameters are to be derived from the application modelCache.
         *
         * @abstract
         * @access public
         * @param parameters (optional) An object containing uriTemplate values, uriTemplate, or a requestId for the operations
         */
        del: function(parameters) {
            throw 'Error: A call was made to an abstract method.  You must provide an override ' +
                'for a valid object definition';
        },
        /**
         * Called upon error for methods with async return values (get, post).  Override for custom behavior.
         *
         * @access public
         * @param event
         * @param requestId
         */
        onError: function(event, requestId) {
            alert("An error occured: " + JSON.stringify(event));
        },

        /**
         * Called upon completion for methods with async return values (get, post).  Override for custom behavior.
         * The default method will write the data value (possible object graph) to the application modelCache
         * if this.modelPath is defined.
         *
         * @access public
         * @param data
         * @param requestId A value that was returned by the initiating POST or GET call
         */
        onComplete: function(data, requestId) { },

        /**
         * Utility method to produce a uri from a template and either the parameters of a provided argument,
         * or from the application's modelCache using the default, local datasource.
         *
         * @param parameters (optional) If not provided, the logic will attempt to fulfill parameters in the template using the model.
         * @return The uri
         */
        getUri: function(parameters) {
            parameters = parameters || {};
            var uri = parameters.uriTemplate || this.uriTemplate;
            var index, key, value;

            while ((index = uri.indexOf('{')) >= 0) {
                key = uri.substring(index + 1, uri.indexOf('}'));
                value = parameters[key];
                if (value === undefined)
                    value = this[key];
                if (value === undefined && this.data !== undefined)
                    value = value || this.data[key];
                if (value === undefined)
                    value = value || '';
                uri = uri.replace('{' + key + '}', value);
            }
            return uri;
        },

        processResult: function(data, parameters) {
            if (this.async || parameters.async) {
                var callback = parameters.onComplete || this.onComplete;
                var requestId = parameters.requestId || this.getUri(parameters);
                window.setTimeout(function() {
                    callback(data, requestId);
                }, 1);
                return requestId;
            } else {
                return data;
            }
        }
    });

    Cajeta.Datasource.MemoryDS = Cajeta.Datasource.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.cache = {};
        },

        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onComplete.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        get: function(parameters) {
            parameters = parameters || {};
            var data = this.cache[this.getUri(parameters)];
            return this.processResult(data, parameters);
        },

        /**
         * Returns a boolean to indicate whether or not the method was
         * executed sucessfully.  If no parameters are provided, the method should assume that
         * this.uriTemplate is a member property, and any parameters are to be derived from the
         * application modelCache.
         *
         * @access public
         * @param data The data to put into the uri
         * @param parameters (optional) Additional parameters, including a uriTemplate, parameters for the instance template, etc.
         */
        put: function(data, parameters) {
            this.cache[this.getUri(parameters)] = data;
            return true;
        },
        /**
         * Delete the resource identified by a uri.  If no parameters are provided, the method should assume that
         * the uriTemplate is a member property, and any parameters are to be derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        del: function(parameters) {
            var uri = this.getUri(parameters), result;
            if (this.cache[uri] !== undefined) {
                delete this.cache(uri);
                result = true;
            } else {
                result = false;
            }
            return result;
        }
    });

    Cajeta.Datasource.CookieDS = Cajeta.Datasource.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onComplete.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        get: function(parameters) {
            parameters = parameters || {};
            var uri = this.getUri(parameters);
            var data = jCookies.get(this.getUri(parameters));
            if (data == null) data = undefined;
            return this.processResult(data, parameters);
        },

        /**
         * Returns a boolean to indicate whether or not the method was
         * executed sucessfully.  If no parameters are provided, the method should assume that
         * this.uriTemplate is a member property, and any parameters are to be derived from the
         * application modelCache.
         *
         * @access public
         * @param data The data to put into the uri
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        put: function(data, parameters) {
            jCookies.set(this.getUri(parameters), data);
            return true;
        },
        /**
         * Delete the resource identified by a uri.  If no parameters are provided, the method should assume that
         * the uriTemplate is a member property, and any parameters are to be derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        del: function(parameters) {
            jCookies.del(this.getUri(parameters));
            return true;
        }
    });

    /**
     * Only provided as a POC.  Unsupported in FF, and IE.
     * @type {*}
     */
    Cajeta.Datasource.DbRestDS = Cajeta.Datasource.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);
            this.db.transaction(function (tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS cache (uri unique, data)');
            });

        },
        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onComplete.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        get: function(parameters) {
            parameters = parameters || {};
            var requestId = parameters.requestId || this.getUri(parameters);
            this.db.transaction(
                function (tx) {
                    tx.executeSql('SELECT * FROM properties', [],
                        function (tx, results) {
                            var callback = parameters.onComplete || this.onComplete;
                            callback(results.rows.item(0), requestId);
                        },
                    null)
                });

             return requestId;
        },

        /**
         * Returns a boolean to indicate whether or not the method was
         * executed sucessfully.  If no parameters are provided, the method should assume that
         * this.uriTemplate is a member property, and any parameters are to be derived from the
         * application modelCache.
         *
         * @access public
         * @param data The data to put into the uri
         * @param parameters (optional) Additional parameters, including a uriTemplate, parameters for the instance template, etc.
         */
        put: function(data, parameters) {
            var uri = this.getUri(parameters);
            this.db.transaction(function(tx) {
                tx.executeSql('INSERT INTO cache (uri, data) VALUES (' + uri + ', ' + data + ')');
            });
            return true;
        },

        /**
         * Delete the resource identified by a uri.  If no parameters are provided, the method should assume that
         * the uriTemplate is a member property, and any parameters are to be derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        del: function(parameters) {
            var uri = this.getUri(parameters);
            this.db.transaction(function(tx) {
                tx.executeSql('DELETE FROM cache WHERE uri = "' + uri + '"');
            });
            return true;
        }

    });


    Cajeta.Datasource.AjaxDS = Cajeta.Datasource.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.contentType = 'application/json';
            this.headers = this.headers || {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
        },
        get: function(parameters) {
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'GET';
            return $.ajax(uri, parameters);
        },
        put: function(data, parameters) {
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'PUT';
            parameters.data = JSON.stringify(data);
            return $.ajax(uri, parameters);
        },
        post: function(data, parameters) {
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'POST';
            parameters.data = JSON.stringify(data);
            return $.ajax(uri, parameters);
        },
        del: function(parameters) {
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'DELETE';
            return $.ajax(uri, parameters);
        },
        params: function(parameters) {
            return $.extend(parameters, {
                complete: parameters.onComplete || parameters.complete || this.onComplete || this.complete,
                error:  parameters.onError || parameters.error || this.onError || this.error,
                processData: false,
                headers: parameters.headers || this.headers,
                async: parameters.async || this.async,
                contentType: parameters.contentType || this.contentType
            });
        }
    });

    return Cajeta;
});