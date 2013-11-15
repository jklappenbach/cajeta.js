/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 3:57 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'infusion.core',
    'jcookies'
], function($, infusion, jCookies) {

    /**
     * The namespace for datasource definitions.
     * @type {Object}
     */
    infusion.ds = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013',
        cache: {},
        STATE_SETTINGS_URI: '/{applicationId}/stateCache/settings',
        STATE_STATES_URI: '/{applicationId}/stateCache/states',
        STATE_STATE_URI: '/{applicationId}/stateCache/states/{stateId}',
        STATE_DATASOURCE_ID: 'STATECACHE_DATASOURCE',
        MESSAGE_DATASOURCE_COMPLETE: 'MESSAGE_DATASOURCE_COMPLETE',
        ERROR_STATE_LOADFAILURE: 'Unable to restore state',
        TOPIC_PUBLISH: 'ds:publish',
        LOCAL: 'local'

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
    infusion.ds.AbstractRestDS = infusion.Class.extend({
        initialize: function(properties) {
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw new Error('infusion.ds.AbstractRestDS.id must be defined');
            if (this.async === undefined)
                this.async = true;
        },

        getId: function() {
            return this.id;
        },

        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onSuccess.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @abstract
         * @access public
         * @param parameters (optional) An object containing uriTemplate values, uriTemplate, or a requestId for the operations
         * @returns The requestId, which is either the the provided requestId, or the generated uri if the id is omitted.
         */
        get: function(parameters) {
            throw new Error('A call was made to an abstract method.  ' +
                'You must provide an override for a valid object definition');
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
            throw new Error('A call was made to an abstract method.  You must provide an override ' +
                'for a valid object definition');
        },
        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onSuccess.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @abstract
         * @access public
         * @param data The data to post to the uri
         * @param parameters (optional) An object containing uriTemplate values, uriTemplate, or a requestId for the operations
         */
        post: function(data, parameters) {
            throw new Error('A call was made to an abstract method.  You must provide an override ' +
                'for a valid object definition');

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
            throw new Error('A call was made to an abstract method.  You must provide an override ' +
                'for a valid object definition');
        },

        /**
         * Called upon completion for methods with async return values (get, post).  Override for custom behavior.
         * The default method will write the data value (possible object graph) to the application modelCache
         * if this.modelPath is defined.
         *
         * @access public
         * @param msg The message, to be published on the topic for this datasource
         */
        onSuccess: function(parameters) {
            infusion.message.dispatch.publish({
                topic: 'ds:publish',
                msg: parameters.msg
            });
        },

        /**
         *
         * @param event
         */
        onError: function(parameters) {
            infusion.message.dispatch.publish({
                topic: 'ds:publish',
                msg: parameters.msg
            });
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
            var uri =  parameters.uri || parameters.uriTemplate || this.uriTemplate;
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
            var uri = this.getUri(parameters);
            var requestId = parameters.requestId || uri;
            var msg = new infusion.message.Message({
                id: uri,
                dsid: this.id,
                modelPath: this.modelPath || parameters.modelPath,
                method: parameters.method,
                requestId: requestId,
                status: 'ok',
                data: data
            });
            if (this.async == true || parameters.async == true) {
                var callback = parameters.onSuccess || this.onSuccess;
                window.setTimeout(function() {
                    callback(msg);
                }, 1);
                return requestId;
            } else {
                return msg;
            }
        }
    });

    infusion.ds.MemoryDS = infusion.ds.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.cache = {};
        },

        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onSuccess.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        get: function(parameters) {
            parameters = parameters || {};
            parameters.method = 'get';
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
            parameters = parameters || {};
            parameters.method = 'put';
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
            parameters = parameters || {};
            parameters.method = 'delete';
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

    infusion.ds.CookieDS = infusion.ds.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },

        /**
         * Async method, returning a boolean to indicate whether or not the method was
         * executed sucessfully.  Any result will be dispatched to onSuccess.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        get: function(parameters) {
            parameters = parameters || {};
            parameters.method = 'get';
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
            parameters = parameters || {};
            parameters.method = 'put';
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
            parameters = parameters || {};
            parameters.method = 'delete';
            jCookies.del(this.getUri(parameters));
            return true;
        }
    });

    /**
     * Only provided as a POC.  Unsupported in FF, and IE.
     * @type {*}
     */
    infusion.ds.DatabaseDS = infusion.ds.AbstractRestDS.extend({
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
         * executed sucessfully.  Any result will be dispatched to onSuccess.  If no parameters are provided,
         * the method should assume that the uriTemplate is a member property, and any parameters are to be
         * derived from the application modelCache.
         *
         * @access public
         * @param parameters (optional) The parameters used to fill in the uriTemplate parameters.
         */
        get: function(parameters) {
            parameters = parameters || {};
            parameters.method = 'get';
            var requestId = parameters.requestId || this.getUri(parameters);
            this.db.transaction(
                function (tx) {
                    tx.executeSql('SELECT * FROM properties', [],
                        function (tx, results) {
                            var callback = parameters.onSuccess || this.onSuccess;
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
            parameters = parameters || {};
            parameters.method = 'put';
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
            parameters = parameters || {};
            parameters.method = 'delete';
            var uri = this.getUri(parameters);
            this.db.transaction(function(tx) {
                tx.executeSql('DELETE FROM cache WHERE uri = "' + uri + '"');
            });
            return true;
        }

    });


    /**
     *
     * @type {*}
     */
    infusion.ds.AjaxDS = infusion.ds.AbstractRestDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.headers = this.headers || {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
        },
        get: function(parameters) {
            parameters = parameters || {};
            parameters.method = 'get';
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'GET';
            return $.ajax(uri, parameters);
        },
        put: function(data, parameters) {
            parameters = parameters || {};
            parameters.method = 'put';
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'PUT';
            parameters.data = JSON.stringify(data);
            return $.ajax(uri, parameters);
        },
        post: function(data, parameters) {
            parameters = parameters || {};
            parameters.method = 'post';
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'POST';
            parameters.data = JSON.stringify(data);
            return $.ajax(uri, parameters);
        },
        del: function(parameters) {
            parameters = parameters || {};
            parameters.method = 'delete';
            var uri = this.getUri(parameters);
            parameters = this.params(parameters);
            parameters.type = 'DELETE';
            return $.ajax(uri, parameters);
        },

        /**
         * Normalizes parameters into those expected by jQuery's Ajax implementation.
         *
         * @param parameters
         * @return {*}
         */
        params: function(parameters) {
            var headers = parameters.headers || this.headers;
            var self = this;
            var success = function (data, textStatus, xhr) {
                var msg = new infusion.message.Message({
                    id: parameters.requestId || '0',
                    dsid: self.id,
                    method: self.method,
                    modelPath: self.modelPath || parameters.modelPath,
                    xhr: xhr,
                    data: data,
                    status: textStatus
                });
                (parameters.onSuccess || self.onSuccess)({
                    msg: msg
                });
            };

            var error = function(xhr, textStatus, errorThrown) {
                var msg = new infusion.message.Message({
                    id: parameters.requestId || '0',
                    dsid: self.id,
                    method: self.method,
                    modelPath: self.modelPath || parameters.modelPath,
                    xhr: xhr,
                    error: errorThrown,
                    status: textStatus
                });
                (parameters.onError || self.onError)({
                    msg: msg
                });
            }

            return $.extend(parameters, {
                success: parameters.onSuccess || success,
                error:  parameters.onError || error,
                processData: false,
                headers: headers,
                async: parameters.async || this.async,
                contentType: headers['Content-Type'] || 'application/json'
            });

        }
    });

    // Default Implementations

    /**
     * The default, memory based state management datasource
     */
    infusion.ds.DefaultStateDS = infusion.ds.MemoryDS.extend({
        initialize: function(properties) {
            if (properties === undefined || properties.applicationId === undefined)
                throw new Error('infusion.ds.DefaultStateDS.applicationId must be defined');
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.async = false;
            properties.uriTemplate = infusion.ds.STATE_STATE_URI;
            properties.settingsUri = this.getUri({
                uriTemplate: infusion.ds.STATE_SETTINGS_URI,
                applicationId: properties.applicationId
            });
            this.settings = {
                stateId: 0,
                nextId: 0,
                keyPeriod: 10
            };
            self.super.initialize.call(this, properties);
        },
        post: function(data, parameters) {
            parameters.stateId = parameters.stateId || this.settings.nextId;
            var uri = this.getUri(parameters);
            this.cache[uri] = data;
            this.settings.stateId = this.settings.nextId++;
            return this.processResult(this.settings.stateId, parameters);
        },
        get: function(parameters) {
            var uri = this.getUri(parameters);
            var data;
            if (uri.indexOf('settings') >= 0) {
                data = this.settings;
            } else {
                data = this.cache[uri];
            }
            return this.processResult(data, parameters);
        }
    });

    return infusion;
});