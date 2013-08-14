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
        onComplete: function(data, requestId) {
            if (this.modelPath === undefined)
                throw Cajeta.ERROR_DATASOURCE_MODELPATH_UNDEFINED;

            if (Cajeta.theApplication === null)
                throw 'Application is not defined';
            Cajeta.theApplication.getModel().set(this.modelPath, data, this.datasourceId);
        },

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
                if (value === undefined && Cajeta.theApplication != null)
                    Cajeta.theApplication.model.get(key);
                uri = uri.replace('{' + key + '}', value);
            }
            return uri;
        },

        processResult: function(data, parameters) {
            if (this.async || parameters.async) {
                var future = new Cajeta.Events.Future({
                    data: data,
                    callback: parameters.onComplete || this.onComplete,
                    requestId: parameters.requestId || this.getUri(parameters),
                    onExecute: function() {
                        this.callback(this.data, this.requestId);
                    }
                });
                window.setTimeout(future.onExecute, 1);
                return future.requestId;
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
    })


    Cajeta.Datasource.AjaxDS = Cajeta.Datasource.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.header = this.header || {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
        },
        createHxr: function() {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                return new ActiveXObject("MSXML2.XMLHTTP.3.0");
            }
        },
        onError: function(event) {
            Console.log("An error occured: " + event);
        },

        /**
         * Do nothing method.  Override if you want to store or act upon data results.
         * @param data
         */
        onComplete: function(data) {
            if (this.modelPath === undefined)
                throw Cajeta.ERROR_DATASOURCE_MODELPATH_UNDEFINED;

            Cajeta.theApplication.getModel().set(this.modelPath, data, this.datasourceId);
        },
        get: function() {
            this._exec('GET', this.url, null, this.onComplete, this.headers);
        },
        put: function(data) {
            this._exec('PUT', this.url, data, this.onComplete, this.headers);
        },
        post: function(data) {
            this._exec('POST', this.url, data, this.onComplete, this.headers);
        },
        del: function() {
            this._exec('DELETE', this.url, null, this.onComplete, this.headers);
        },

        _exec: function(method, url, data, callback, headers) {
            var hxr = this.createHxr();
            var headers = (headers !== undefined) ? headers : this.headers;

            hxr.open(method, url, true);
            hxr.onerror = this.onError;

            if (callback != null && callback !== undefined) {
                hxr.onreadystatechange = callback;
            } else {
                hxr.onreadystatechange = this.onComplete;
            }

            for (var name in headers) {
                if (name !== undefined)
                    hxr.setRequestHeader(name, headers[name]);
            }

            if (data !== undefined) {
                data = $.param(data, true);
                hxr.send(data);
            } else {
                hxr.send();
            }
        }
    });

    return Cajeta;
});