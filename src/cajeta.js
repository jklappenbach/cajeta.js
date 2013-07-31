/**
 * cajeta.js
 *
 * Copyright (c) 2012 Julian Klappenbach
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:

 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.'
 */

define([
    'jquery',
    'vcdiff',
    'jcookies'
], function($, vcDiff, jCookies) {

    /**
     * Runtime info, including author, verison, and license information.
     * Supports Cajeta.theApplication, which needs to be initialized with the
     * instance of the application.  This variable is used internally for framework
     * operation.
     */
    var Cajeta = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013',
        theApplication: null,
        constants: {
            ERROR_EVENT_ID_UNDEFINED: 'Error: Cajeta.Events.Event.id is undefined',
            ERROR_AJAX_MODELPATH_UNDEFINED: 'Error: Cajeta.Datasource.Ajax.modelPath must be defined',
            ERROR_AJAX_DATASOURCEID_UNDEFINED: 'Error: Cajeta.Datasource.Ajax.datasourceId must be defined',
            ERROR_RESTAJAX_URITEMPLATE_UNDEFINED: 'Error: A Cajeta.Datasource.RestAjax.uriTemplate must be defined in properties',
            ERROR_STATECACHE_LOADFAILURE: 'Error: Unable to restore state',
            ERROR_MODELCACHE_PATH_UNDEFINED: 'Error: "{0}" could not be resolved to an entry',
            ERROR_MODELADAPTOR_MODELPATH_UNDEFINED: 'Error: modelPath must be defined',
            ERROR_COMPONENT_MODELADAPTOR_UNDEFINED: 'Error: Cajeta.View.Component.modelAdaptor must be defined for "{0}"',
            ERROR_COMPONENT_COMPONENTID_UNDEFINED: 'Error: Cajeta.View.Component.componentId must be defined',
            ERROR_COMPONENT_INVALIDTEMPLATE: 'Error: Invalid template for "{0}"; must contain an element with a templateId of "{1}"',
            ERROR_COMPONENT_DOCK_UNDEFINED: 'Error: Dock failed, unable to resolve an element with componentId "{0}" in target HTML',
            ERROR_COMPONENT_DOCK_MULTIPLE: 'Error: Dock failed, more than one element was found with componentId "{0}" in target HTML',
            ERROR_MODELADAPTOR_COMPONENT_UNDEFINED: 'Error: Cajeta.View.ModelAdaptor.component must be defined',
            ERROR_APPLICATION_PAGE_UNDEFINED: 'Error: Page "{0}" undefined',
            DEFAULT_PAGETITLE: 'Default Cajeta Page',
            LOCAL_DATASOURCE: 'local'
        },
        safeEntry: function(key, map) {
            var entry = map[key];
            if (entry === undefined) {
                entry = {};
                map[key] = entry;
            }
            return entry;
        }

    };

    // Adding a proper String.format method
    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }

    // JavaScript object model, based on jQuery, but using some additional
    // strategies to enable polymorphism.
    Cajeta.Class = function() { };

    // A global flag to prevent the execution of constructors when in the class
    // definition phase.
    Cajeta.Class.defining = new Boolean();

    /**
     * Use this method to extend an existing class.  While mixins are supported,
     * inheritance and proper OO design still provide the best mechanisms for
     * code reuse, extension, and long term maintenance.
     *
     * @param definition The definition with which to extend the base object.
     * @return The extended object.
     */
    Cajeta.Class.extend = function(definition) {
        Cajeta.Class.defining = true;

        // A proxy constructor for objects, avoids calling constructors (initialize)
        // when object definition logic is executed.
        var child = function() {
            if (!Cajeta.Class.defining) {
                if (this.initialize !== undefined) {
                    this.initialize.apply(this, arguments);
                }
            }
        }

        // Create the prototype for the new class, and populate it...
        child.prototype = new this();
        child.prototype.super = this;
        $.extend(true, child.prototype.super, this.prototype);
        $.extend(true, child.prototype, definition);

        child.extend = this.extend;
        Cajeta.Class.defining = false;
        return child;
    };


    Cajeta.Events = {
        MODELCACHE_CHANGED: 'MODELCACHE_CHANGED'
    };

    Cajeta.Events.Event = Cajeta.Class.extend({

        initialize: function(properties) {
            properties = properties || {};
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw Cajeta.constants.ERROR_EVENT_ID_UNDEFINED;
        },
        getId: function() {
            return this.id;
        },
        getEventKey: function() {
            var key = this.op === undefined ? this.id : this.id + ':' + this.op;
            return key;
        },
        getData: function() {
            return this.data;
        }
    });

    Cajeta.Events.EventDispatch = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(true, this, properties);
            this.eventListenerMap = {};
        },
        /**
         * Dispatch an event, with the provision of a
         * @param event
         * @param ignore
         */
        dispatchEvent: function(event, ignore) {
            var listeners = this.eventListenerMap[event.getEventKey()];
            if (listeners !== undefined) {
                for (var listenerId in listeners) {
                    if (listenerId !== undefined) {
                        var listener = listeners[listenerId];
                        if (listener != ignore)
                            listener.onEvent(event);
                    }
                }
            }
        },
        /**
         * Add a listener for specific events
         * @param listener The listener target to be called upon an event
         * @param eventId The eventId, required to
         * @param operand (optional) Some events have an operand that can be used as criteria
         */
        addListener: function(listener, eventId, operand) {
            if (listener === undefined || eventId === undefined)
                throw 'Error: invalid registration parameters for Cajeta.Events.EventDispatch.addListener';
            var key = operand === undefined ? eventId : eventId + ':' + operand;
            var listeners = Cajeta.safeEntry(key, this.eventListenerMap);
            listeners[listener.getId()] = listener;
        },
        removeListener: function(eventId, listener) {
            var listeners = this.eventListenerMap[eventId];
            if (listeners !== undefined) {
                delete listeners[listener.getId()];
            }
        }
    });

    /**
     * Abstract base class
     * @type {*}
     */
    Cajeta.Events.Listener = Cajeta.Class.extend({
        getId: function() {
            throw 'Error: unimplemented';
        },
        onEvent: function(event) {
            throw 'Error: unimplemented';
        }
    });

    Cajeta.Datasource = {};

    /**
     * Centralized cache for Datasources
     *
     * @type {*}
     */
    Cajeta.Datasource.map = new Object();


    // TODO Should we support encoding formats (accept)?
    Cajeta.Datasource.Ajax = Cajeta.Class.extend({
        initialize: function(properties) {
            if (properties !== undefined)
                $.extend(true, this, properties);
            this.header = this.header || {};
            Cajeta.Datasource.map[this.datasourceId] = this;
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
                throw Cajeta.constants.ERROR_AJAX_MODELPATH_UNDEFINED;

            Cajeta.theApplication.getModel().set(this.modelPath, data, this.datasourceId);
        },

        exec: function(method, url, data, callback, headers) {
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

    /**
     * An adaptor class used by model entries to interace with a data source.
     * API methods are designed to support REST based communication.
     */
    Cajeta.Datasource.RestAjax = Cajeta.Datasource.Ajax.extend({
        /**
         * The properties argument for the adaptor must contain an entry for the model.  Any data returned from get
         * or post methods will be stored in the model.
         * @param properties
         */
        initialize: function(properties) {
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);

            if (this.uriTemplate === null) {
                throw Cajeta.constants.ERROR_RESTAJAX_URITEMPLATE_UNDEFINED;
            }
        },
        put: function(data) {
            this.exec('PUT', this.uri(), data, this.onComplete, this.headers);
        },
        get: function() {
            this.exec('GET', this.uri(), null, this.onComplete, this.headers);
        },
        post: function(data) {
            this.exec('POST', this.uri(), data, this.onComplete, this.headers);
        },
        del: function() {
            this.exec('DELETE', this.uri(), null, this.onComplete, this.headers);
        },

        /**
         * This method takes the uriTemplate maintained by this instance, and replaces
         * key tags '{[KEY_NAME]}' with values from the current model, using 'local'
         * for the datasourceId.
         *
         * @return The string of the computed URI
         */
        uri: function() {
            var result = this.uriTemplate;
            var startIndex = result.indexOf('{');

            while (startIndex >= 0) {
                var endIndex = result.indexOf('}');
                var key = result.substring(startIndex + 1, endIndex - 1);
                var value = Cajeta.theApplication.getModel().get(key);
                result = result.replace('{' + key + '}', value);
                startIndex = result.indexOf('{');
            }

            return result;
        }
    });


    /**
     * The Model, as in traditional MVC architectures, defines the architecture and interfaces for how data is managed,
     * and how components in an application are updated when the model changes.  Like Wicket, each component maintains
     * a reference to a model object.  In addition, a component leverages a ModelAdaptor class to convert between model
     * state, and the underlying template and html.
     *
     * To support both local and server based data sources, Component Model objects are maintained in a map by an
     * AbstractDataSource object.  This serves as a base class for both server and client-only architectures.
     * @type {Object}
     */
    Cajeta.Model = {};

    /**
     * Cajeta.ModelSnapshotCache must support the following use cases:
     *  1.  Add a new snapshot to the collection, using Snapshot's compress
     *      function (currently delta compression) to reduce overhead
     *  2.  Maintain a set of "key frame" snapshots, so that the number of delta-decompression
     *      steps is kept under some maximum limit (perhaps every 10 frames).
     *  3.  Support state restoration of an arbitrary snapshot entry.
     *      a.  While individual snapshot elements will know how to reconstruct themselves given the
     *          previous state, it will be up to the Cache to know how to walk back to a "key frame",
     *          as well as how to iterate through each element in the list, to restore state.
     *  4.  Delete an existing state entry (or the entire cache)
     *  5.  Support an API that can easily be overridden for remote server implementation.  It would be cool
     *      to have application snapshot state stored centrally for mobile applications.
     */
    Cajeta.Model.StateCache = Cajeta.Class.extend({
        initialize: function(properties) {
            properties = properties || {};
            $.extend(this, properties);
            this.vcd = new Diffable.Vcdiff();
            this.vcd.blockSize = 3;
            this.cache = {};
            this.stateId = 0;
            this.nextId = 0;
            this.modelJson = "{ }";
            this.keyPeriod = this.keyPeriod || 10;
        },
        getStateId: function() {
            return this.stateId;
        },

        add: function(model) {
            var json = JSON.stringify(model);
            if (this.nextId % this.keyPeriod > 0) {
                this.cache[this.nextId] = this.vcd.encode(this.modelJson, json);
            } else {
                this.cache[this.nextId] = json;
            }
            this.stateId = this.nextId++;
            this.modelJson = json;
            return this.stateId;
        },

        /**
         * First, find the key frame, and then iterate to the desired ID, restoring along the way.
         *
         * @param stateId
         */
        load: function(stateId) {
            var start = stateId - (stateId % this.keyPeriod);
            this.modelJson = this.cache[start];
            if (this.modelJson === undefined)
                throw Cajeta.constants.ERROR_STATECACHE_LOADFAILURE;
            var delta;
            for (var i = start + 1; i <= stateId; i++) {
                if (this.cache[i] === undefined)
                    throw Cajeta.constants.ERROR_STATECACHE_LOADFAILURE;
                this.modelJson = this.vcd.decode(this.modelJson, this.cache[i]);
            }
            this.stateId = stateId;
            return JSON.parse(this.modelJson);
        },

        /**
         * Clear all entries.
         */
        clearAll: function() {
            this.cache = {};
            this.stateId = 0;
        }
    });


    /**
     * <h1>Cajeta.Model.ModelCache</h1>
     *
     * Cajeta.ModelCache provides a centralized container and services for an application's data model.
     * By placing the data for the application's model in a tree under a single element, we gain some significant
     * benefits.  First, it becomes a simple matter to bind components to data, ensuring that any changes are reflected
     * in a mapped two-way relationship.  Second, we gain the ability to easily distil application state into the
     * population of the underlying tree.  This state data can be snapshotted, converted to JSON, stored remotely, and
     * even shared with other clients.  With snapshots, we also gain the ability to easily implement undo, redo, and
     * restore operations.  Finally, we gain a degree of simplicity with this architecture. If there are data related
     * issues with the application, there's a clear place to start for diagnosis and maintenance efforts.
     *
     * <h2>Cache to Component Surjection</h2>
     * In providing bindings between components and values in the cache, the framework supports a surjection, or a
     * one-to-many (1:*) between a model node value and a set of components.  Components map their internal DOM
     * state to the model using a contained Cajeta.View.ModelAdaptor instance.  When one component's state is modified,
     * it's changes are persisted to the model, which then uses its internal mappings to identify the other components
     * to notify.
     *
     * <h2>Datasource Support</h2>
     * ModelCache has been designed around the support of multiple datasources by first providing a central
     * access point for shared datasources.  It further provides support by segmenting the cache by datasourceId,
     * simplifying design, and preventing possible namespace collisions in result sets (both sets could have foo.bar
     * as a valid path).   This has implications on potential designs for model structures.
     *
     * <h2>Cache Structure</h2>
     * While the cache has been envisioned to be a set of connected graphs, one per datasource, the application
     * developer is free to assign an arbitrary structure for the application model.  By default, a "local" datasource
     * is populated in the model, and can handle most transient data requirements.  For remote PUT requests, the
     * developer can create an entry for the datasource, using the URI for an ID, and add elements to the cache that
     * will serialize out to the JSON HTML body entity, or at least contain placeholders for query or URI arguments.
     * In the case of a POST, where data is bidirectional, the datasource entry in the cache can be populated with a
     * "request" and "response" root elements to separate outgoing from incoming data. For remote GET requests, JSON
     * result sets can be evaluated and placed directly under the datasource entry.
     *
     * Again, all of these are simply suggestions. The developer is free to structure their data, and the adaption
     * logic of that data to components, however they see fit.  The important
     *      *
     */
    Cajeta.Model.ModelCache = Cajeta.Events.EventDispatch.extend({
        /**
         * @param properties
         */
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);

            this.componentMap = this.componentMap || {};
            this.nodeMap = this.nodeMap || {};
            this.stateCache = this.stateCache || new Cajeta.Model.StateCache();

            // First, see if we've been initialized with a desired stateId.  If not,
            // check to see if we have one in a cookie.  Otherwise, set it to zero.
            // TODO:  See if we can move this logic into the StateCache, without being difficult to intialize from the outside.
            if (this.stateId === undefined) {
                this.stateId = jCookies.get("stateId");
                this.stateId = this.stateId || 0;
            }

            if (this.stateId != 0)
                this.stateCache.load(this.stateId);

            if (this.autoSnapshot === undefined)
                this.autoSnapshot = false;
        },

        /**
         * Sets a node in the model cache.  If datasourceId is ommitted, it will default to LOCAL_DATASOURCE.  If
         * component is present, it will prevent the notification of an update to the issuing component.
         *
         * @param modelPath The path to the node in the model cache
         * @param value The value to set
         * @param datasourceId (optional) The ID of the datasource, defaults to 'local'
         * @param component (optional) The issuing component, prevent cyclical updates.
         */
        set: function(modelPath, value, datasourceId, component) {
            datasourceId = datasourceId || Cajeta.constants.LOCAL_DATASOURCE;
            modelPath = datasourceId + ':' + modelPath;

            // Find out if we have a single key, or a walk, and populate the map
            // if necessary to support the parent
            var index = modelPath.lastIndexOf('.');
            var key = null, node = null, parentPath = null;
            if (index >= 0) {
                parentPath = modelPath.substring(0, index);
                key = modelPath.substring(index + 1);
                var paths = modelPath.substring(0, index).split('.');
                node = this.nodeMap;
                for (var pathKey in paths) {
                    node = Cajeta.safeEntry(paths[pathKey], node);
                }
//                node = this.nodeMap[parentPath];
            } else  {
                key = modelPath;
                node = this.nodeMap;
            }

            // Then remove the indexes on child nodes of the element to be replaced
            this._removeNodeMapEntries(modelPath, node);

            node[key] = value;

            // And index the children of the new value
            this._addNodeMapEntries(modelPath, value, component);

            // Take a snapshot if we have auto set
            if (this.autoSnapshot == true)
                this.stateCache.add(this.state);

            // And send out a general notification on model changed.
            this.dispatchEvent(new Cajeta.Events.Event({ id: Cajeta.Events.MODELCACHE_CHANGED }));
        },

        /**
         * Returns an object graph from the
         * @param datasourceId
         * @param modelPath
         * @return {*}
         */
        get: function(modelPath, datasourceId) {
            modelPath = (datasourceId || Cajeta.constants.LOCAL_DATASOURCE) + ':' + modelPath;
            var node = this.nodeMap[modelPath];
            if (node === undefined)
                throw Cajeta.constants.ERROR_MODELCACHE_PATH_UNDEFINED.format(modelPath);
            return node;
        },

        /**
         * Removes a node from the model.
         *
         * @param modelPath The path to the parent node for removal
         * @param datasourceId (optional) The ID of the datasource, defaults to 'local'
         */
        remove: function(modelPath, datasourceId) {
            datasourceId = datasourceId || Cajeta.constants.LOCAL_DATASOURCE;
            modelPath = datasourceId + ':' + modelPath;

            if (this.nodeMap[modelPath] !== undefined) {
                var index = modelPath.lastIndexOf('.');
                var parent, key;
                if (index >= 0) {
                    parent = this.nodeMap[modelPath.substring(0, index)];
                    key = modelPath.substring(index + 1);
                } else {
                    parent = this.nodeMap[modelPath];
                    key = modelPath;
                }

                this._removeNodeMapEntries(modelPath, this.nodeMap[modelPath])
                delete parent[key];
            }

            var event = new Cajeta.Events.Event({ id: Cajeta.Events.MODELCACHE_CHANGED });
            this.dispatchEvent(event);
        },

        /**
         * Clear all entries from the map
         */
        clearAll: function() {
            this.nodeMap = {};
        },

        getStateId: function() {
            return this.stateCache.getStateId();
        },

        /**
         * Saves the current model state to the stateCache, and returns the
         * ID applied to the save operation for future restoration.
         *
         * @return The new stateId
         */
        saveState: function() {
            return this.stateCache.add(this.nodeMap);
        },

        /**
         * Change the model to the history state indicated by stateId.  After the state has been
         * reconstituted, which includes all entries for path and component maps, every component within
         * the componentMap will be notified of an update.
         *
         * @param stateId The id of the history snapshot to restore and make current
         */
        loadState: function(stateId) {
            // First, check to see that the session ID matches our current...
            if (stateId == this.stateCache.getStateId())
                return;

            this.nodeMap = this.stateCache.load(stateId);

            // Now, notify all the things...
            for (var eventKey in this.eventListenerMap) {
                if (eventKey !== undefined) {
                    var event = new Cajeta.Events.Event({
                        id: Cajeta.Events.MODELCACHE_CHANGED,
                        op: eventKey
                    });
                    var listeners = this.eventListenerMap[eventKey];
                    for (var listenerId in listeners) {
                        if (listenerId !== undefined) {
                            listener.onEvent(event);
                        }
                    }
                }
            }
        },

        /**
         * A helper override to simplify listenership.  It makes much more sense to have
         * modelAdaptors listen to model events.  However, for registration, it's easier to
         * just pass in a component.
         *
         * @param listener The listener to register for an event.
         * @param eventId The id of the event.
         * @param eventOp (optional) The operand to filter the event.
         */
        addListener: function(listener, eventId, eventOp) {
            if (listener instanceof Cajeta.View.Component) {
                listener = listener.modelAdaptor;
            }
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.addListener.call(this, listener, eventId, eventOp);
        },

        /**
         * @private Internal method to recursively remove object graphs from the nodeMap
         *
         * @param modelPath The current model path to delete.
         * @param node The current node for recursion
         */
        _removeNodeMapEntries: function(modelPath, node) {
            if (typeof node != 'string' && typeof node != 'String') {
                for (var name in node) {
                    if (name !== undefined) {
                        this._removeNodeMapEntries(modelPath + '.' + name, node[name]);
                    }
                }
            }
            delete this.nodeMap[modelPath];
        },

        /**
         * @private Internal method, indexes object graphs added to the model using the pathMap
         *
         * @param modelPath The model path of the map in the current frame.
         * @param value A node in the object graph to add, algorithm will recurse to all leaves.
         * @param component Used to prevent cycles in update notification
         */
        _addNodeMapEntries: function(modelPath, value, component) {
            this.nodeMap[modelPath] = value;
            if (typeof value !== "string") {
                for (var name in value) {
                    if (name !== undefined) {
                        this.nodeMap[modelPath + '.' + name] = value[name];
                        this._addNodeMapEntries(modelPath + '.' + name, value[name], component);
                    }
                }
            }

            // And notify any components bound to this modelPath...
            var ignore = component === undefined ? undefined : component.modelAdaptor;
            this.dispatchEvent(new Cajeta.Events.Event({
                    id: Cajeta.Events.MODELCACHE_CHANGED,
                    op: modelPath
                }), ignore
            );
        }
    });

    Cajeta.View = {
        homePage: 'homePage'
    };

    /**
     * ModelAdaptor keeps a component and its corresponding model entry synchronized.  Changes to model
     * entries are directed to onModelChanged.  Conversely, changes to the component are handled by OnComponentUpdate.
     * This class maintains variables that resolve (and bind) a component to a model entry.
     * Component.setModelAdaptor.
     */
    Cajeta.View.ModelAdaptor = Cajeta.Events.Listener.extend({
        initialize: function(properties) {
            properties = properties || {};
            $.extend(this, properties, true);
            this.datasourceId = this.datasourceId || Cajeta.constants.LOCAL_DATASOURCE;
            if (this.modelPath === undefined)
                throw Cajeta.constants.ERROR_MODELADAPTOR_MODELPATH_UNDEFINED;
        },
        getId: function() {
            return this.component.getCanonicalId();
        },
        setComponent: function(component) {
            this.component = component;
        },
        getDatasourceId: function() {
            return this.datasourceId;
        },
        getModelPath: function() {
            return this.modelPath;
        },
        /**
         * Handles ModelCache change events, applying new data to the component and html.
         * Override this for additional functionality
         *
         * @param event The event containing updated data
         */
        onEvent: function(event) {
            if (this.component === undefined)
                throw Cajeta.constants.ERROR_MODELADAPTOR_COMPONENT_UNDEFINED;
            if (event.getId() == Cajeta.Events.MODELCACHE_CHANGED) {
                this.component.setModelValue(event.getData(), true);
            }
        },
        getEventKey: function() {
            return this.datasourceId + ':' + this.modelPath;
        },
        onComponentChanged: function(data) {
            data = data || this.component.getModelValue();
            Cajeta.theApplication.getModel().set(this.modelPath, data, this.datasourceId, this.component);
        }
    });

    Cajeta.View.EventCallback = $.extend(true, Function.prototype, {
        setInstance: function(instance) { this.instance = instance; }
    });

    /**
     * Component, the base for all Cajeta view classes.  Components feature an API for child management,
     * rendering and state management.
     *
     */
    Cajeta.View.Component = Cajeta.Class.extend({
        /**
         * Constructor supports mixins for fast definitions.  If only a few methods are needed, this
         * can be an easier way of extending functionality than inheritance.  A componentId must be specified.
         * Other properties include: modelPath, defaultValue (for model), as well as
         * values using elementValue or attr* for element values and attributes, and methods using
         * onHtml* for event handlers.  For portable, re-usable definitions, consider subclassing.
         *
         * For polymorphism, always invoke superclass definitions with call or apply, using the top level
         * this pointer.  Use this.super to select the correct superclass implementation.  And include 'self'
         * as a property, using this.super as the value.  Javascript does not maintain this internally, so
         * passing 'super' in will ensure that the correct definition 'frame' is maintained.
         *
         * @param properties
         */
        initialize: function(properties) {
            properties = properties || {};
            $.extend(this, properties);
            if (this.componentId === undefined)
                throw Cajeta.constants.ERROR_COMPONENT_COMPONENTID_UNDEFINED;
            this.parent = null;
            this.attributes = this.attributes || {};
            this.properties = this.properties || {};
            this.cssAttributes = this.cssAttributes || {};
            this.children = {};
            this.hotKeys = {};
            this.viewStateId = '';
            this.visible = this.visible || true;

            // Default setting for valueTarget
            this.modelEncoding = this.modelEncoding || "attr:value"; // Could be attr:*, prop:*, or text (element text)

            if (this.modelAdaptor === undefined && this.modelPath !== undefined) {
                this.modelAdaptor = new Cajeta.View.ModelAdaptor({
                    modelPath: properties.modelPath,
                    datasourceId: properties.datasourceId
                });
                this.modelAdaptor.component = this;
            } else if (this.modelAdaptor !== undefined) {
                this.modelAdaptor.component = this;
            }

            if (this.modelValue !== undefined)
                this.setModelValue(this.modelValue);

            delete this.modelPath;
            delete this.datasourceId;
        },

        /**
         *
         * @return {*}
         */
        getComponentId: function() {
            return this.componentId;
        },

        /**
         *
         * @param componentId
         */
        setComponentId: function(componentId) {
            if (componentId !== undefined) {
                this.componentId = componentId;
            }
        },

        /**
         *
         * @return {*}
         */
        getCanonicalId: function() {
            if (parent !== undefined && parent.getCanonicalId !== undefined)
                return parent.getCanonicalId() + '.' + this.componentId;
            else
                return this.componentId;
        },

        setModelAdaptor: function(modelAdaptor) {
            this.modelAdaptor = modelAdaptor;
            this.modelAdaptor.component = this;
        },

        getModelAdaptor: function() {
            return this.modelAdaptor;
        },

        /**
         *
         *
         */
        getModelValue: function() {
            var params = this.modelEncoding.split(':');
            switch (params[0]) {
                case 'attr' :
                    return this.attr(params[1]);
                case 'prop' :
                    return this.prop(params[1]);
                case 'text' :
                    return this.text();
            }
        },

        /**
         * Sets the model value for the component, using the encoding format specified
         * in the property modelEncoding.  The param internal is optional, and should only
         * be used by the framework for setting component state in response to model updates,
         * preventing recursion.
         *
         * @param value The value to set.
         * @param internal (optional) True, if the call is the result of a model change.
         */
        setModelValue: function(value, internal) {
            var params = this.modelEncoding.split(':');
            switch (params[0]) {
                case 'attr' :
                    this.attr(params[1], value);
                    break;
                case 'prop' :
                    this.prop(params[1], value);
                    break;
                case 'text' :
                    this.text(value);
                    break;
            }

            if (internal === undefined || internal == false) {
                this.modelAdaptor.onComponentChanged(value);
            }
        },

        /**
         *
         * @return The type of element this targets, used to autogenerate markup.
         */
        getElementType: function() {
            return this.elementType;
        },

        /**
         * The type of element targeted by this component.  Used to autogenerate HTML for replacement
         * @param elementType The new element type for this component.
         */
        setElementType: function(elementType) {
            this.elementType = elementType;
        },

        /**
         * Safe method of assigning a value to an element attribute.  If the element in question has not been
         * instantiated (not in the DOM), the value will be held in a map until the element has been instantiated
         * and added to the DOM, at which point the value will be used to initialize the element attribute.
         *
         * If no value is provided, the method acts as an accessor.  If the element has not been instantiated, the
         * value held in the Component's attribute map will be returned.
         *
         * @param name
         * @param value
         * @return {*}
         */
        attr: function(name, value) {
            if (value === undefined) {
                if (this.isDocked()) {
                    return this.dom.attr(name);
                } else if (this.template !== undefined) {
                    return this.template.attr(name);
                } else {
                    return this.attributes[name];
                }
            } else {
                if (this.isDocked()) {
                    this.dom.attr(name, value);
                }
                if (this.template !== undefined) {
                    this.template.attr(name, value);
                }
                this.attributes[name] = value;
            }
        },

        /**
         * Safe method of assigning a value to an element property.  If the element in question has not been
         * instantiated (not in the DOM), the value will be held in a map until the element has been instantiated
         * and added to the DOM, at which point the value will be used to initialize the element property.
         *
         * If no value is provided, the method acts as an accessor.  If the element has not been instantiated, the
         * value held in the Component's property map will be returned.
         *
         * @param name
         * @param value
         * @return {*}
         */
        prop: function(name, value) {
            if (value === undefined) {
                if (this.isDocked()) {
                    return this.dom.prop(name);
                } else if (this.template !== undefined) {
                    return this.template.prop(name);
                } else {
                    return this.properties[name];
                }
            } else {
                if (this.isDocked()) {
                    this.dom.attr(name, value);
                }
                if (this.template !== undefined) {
                    this.template.prop(name, value);
                }
                this.properties[name] = value;
            }
        },

        /**
         * Safe method of assigning a value to an element css attribute.  If the element in question has not been
         * instantiated (not in the DOM), the value will be held in a map until the element has been instantiated
         * and added to the DOM, at which point the value will be used to initialize the element.
         *
         * If no value is provided, the method acts as an accessor.  If the element has not been instantiated, the
         * value held in the Component's css map will be returned.
         *
         * @param name
         * @param value
         * @return {*}
         */
        css: function(name, value) {
            if (value === undefined) {
                if (this.isDocked()) {
                    return this.dom.css(name);
                } else if (this.template !== undefined) {
                    return this.template.css(name);
                } else {
                    return this.cssAttributes[name] = value;
                }
            } else {
                if (this.isDocked()) {
                    this.dom.css(name, value);
                } else if (this.template !== undefined) {
                    this.template.css(name, value);
                } else {
                    this.cssAttributes[name] = value;
                }
            }
        },

        /**
         * Sets or gets the html value of this component.
         *
         * If no argument is provided, the call is treated
         * as a getter.  Returned value may depend on whether the
         * component is docked.  If undocked, either the template or previously defined html member
         * value is returned.
         *
         * If an argument is provided, the call is treated as a setter.  The effect of the call
         * will depend on the state of the component.  If docked, this will directly replace the html
         * of the component in the DOM.  If undocked, it will replace the HTML of an existing template.
         * Otherwise, it will set the html member variable, to be utilized when the component is next
         * docked.
         * @param value The HTML to be applied (optional).
         * @return The value of the existing HTML setting for the component, dependent on state.
         */
        html: function(value) {
            if (value === undefined) {
                if (this.isDocked()) {
                    return this.dom.html();
                } else if (this.template !== undefined) {
                    return this.template.html();
                } else
                    return this.html;
            } else {
                if (this.isDocked()) {
                    this.dom.html(value);
                } else if (this.template !== undefined) {
                    this.template.html(value);
                } else {
                    this.html = value;
                }
            }
        },
        text: function(value) {
            if (value === undefined) {
                if (this.isDocked()) {
                    return this.dom.text();
                } else if (this.template !== undefined) {
                    return this.template.text();
                } else {
                    return this.textValue;
                }
            } else {
                if (this.isDocked()) {
                    this.dom.text(value);
                } else if (this.template !== undefined) {
                    this.template.text(value);
                } else {
                    this.textValue = value;
                }
            }
        },

        /**
         * Add a component as a child.  The component must have a valid id.  It's parent
         * attribute will be set to the owning component.
         *
         * @param component
         */
        addChild: function(component) {
            var componentId = component.getComponentId();
            if (componentId == undefined || componentId == '') {
                throw Cajeta.constants.ERROR_COMPONENT_COMPONENTID_UNDEFINED;
            }
            this.children[componentId] = component;
            component.parent = this;
        },

        /**
         *
         * @param componentId
         */
        removeChild: function(componentId) {
            if (this.children[componentId] !== undefined) {
                this.children[componentId].undock();
                delete this.children[componentId].parent;
                delete this.children[componentId];
            }
        },

        /**
         *
         */
        removeAllChildren: function() {
            for (var name in this.children) {
                if (name !== undefined) {
                    this.children[name].undock();
                    delete this.children[name].parent;
                    delete this.children[name];
                }
            }
        },

        /**
         * A template is a fragment of HTML that is injected into a target element upon docking.
         * If no template has been assigned, the exsting markup in the DOM will be used.
         * When a valid DOM element has been created, any preserved attributes are assigned to the
         * element.
         *
         * @param templateId The ID of the template
         * @param template The template source, may contain many templates.
         */
        setTemplate: function(templateId, template) {
            var temp = $(template);
            if (temp.length > 0) {
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i].attributes != undefined) {
                        var attrValue = temp[i].attributes['templateId'];

                        if (attrValue != undefined && attrValue.value == templateId) {
                            this.template = $(temp[i]);

                            this.template.attr('componentId', this.componentId);

                            for (var name in this.attributes) {
                                if (name !== undefined)
                                    this.template.attr(name, this.attributes[name]);
                            }
                            for (var name in this.properties) {
                                if (name !== undefined)
                                    this.template.prop(name, this.properties[name]);
                            }
                            for (var name in this.cssAttributes) {
                                if (name !== undefined)
                                    this.template.css(name, this.cssAttributes[name]);
                            }
                            if (this.textValue !== undefined)
                                this.template.text(this.textValue);
                            break;
                        }
                    }
                }
            }
            if (this.template === undefined) {
                throw Cajeta.constants.ERROR_COMPONENT_INVALIDTEMPLATE.format(this.getCanonicalId(), templateId);
            }
        },
        getTemplate: function() {
            return this.template;
        },

        /**
         * We tell if the component is docked (referring to live HTML in the DOM) by first checking to
         * see if the template is non-null.  Since templates can be provided for substitution, we need
         * to further check to see if the html parentNode is a valid DOM element, or if it's a DocumentFragment or
         * even undefined.
         *
         * @return {Boolean}
         */
        isDocked: function() {
            return (this.dom !== undefined);
        },

        /**
         *
         */
        dock: function() {
            if (!this.isDocked()) {
                var type = this.getElementType();
                this.dom = $(type + '[componentid = "' + this.componentId + '"]');
                if (this.dom.length == 0) {
                    throw Cajeta.constants.ERROR_COMPONENT_DOCK_UNDEFINED.format(this.componentId);
                } else if (this.dom.length > 1) {
                    throw Cajeta.constants.ERROR_COMPONENT_DOCK_MULTIPLE.format(this.componentId);
                }
                if (this.template === undefined) {
                    // Synchronize with any settings made before dock
                    for (var name in this.attributes) {
                        if (name !== undefined)
                            this.dom.attr(name, this.attributes[name]);
                    }
                    for (var name in this.properties) {
                        if (name !== undefined)
                            this.dom.prop(name, this.properties[name]);
                    }
                    for (var name in this.cssAttributes) {
                        if (name !== undefined)
                            this.dom.css(name, this.cssAttributes[name]);
                    }
                    if (this.textValue !== undefined)
                        this.dom.text(this.textValue);
                } else {
                    this.dom.html(this.template.html());
                }

                // Finally, ensure we have assigned the component ID to the fragment
                this.attr('componentId', this.componentId);
                Cajeta.theApplication.model.addListener(this.modelAdaptor, Cajeta.Events.MODELCACHE_CHANGED,
                    this.modelAdaptor.getEventKey());

                // Add to the application component map at this point.
                Cajeta.theApplication.getComponentMap()[this.componentId] = this;
            }
        },

        /**
         * Remove a component from the window's DOM.  This method will recursively undock all children of the
         * component.  Furthermore, the component will be unbound from the Model, to prevent unnecessary
         * update calls for undisplayed elements.
         */
        undock: function() {
            for (var componentId in this.children)
                this.children[componentId].undock();

            if (this.isDocked()) {
                delete this.dom;
            }

            Cajeta.theApplication.getModel().releaseComponent(this);
        },

        /**
         * Binds the events generated by the html managed by this component to it's event handlers.
         * The logic follows a naming convention where methods named onHtml* will be bound to their corresponding
         * * events.  These include: change, mouseOver, mouseOut, focus, blur, and click.
         */
        bindHtmlEvents: function() {
            if (this.dom !== undefined) {
                for (var name in this) {
                    var index = name.indexOf('onHtml');
                    if (index >= 0) {
                        var eventName = name.substring(index + 6).toLocaleLowerCase();
                        var eventData = new Object();
                        eventData['that'] = this;
                        eventData['fnName'] = name;
                        this.dom.bind(eventName, eventData, Cajeta.View.Component.htmlEventDispatch);
                    }
                }
            }
        },

        /**
         *
         * @return {*}
         */
        getHotKeys: function() {
            return this.hotKeys;
        },

        /**
         * In the rendering phase, components are handed a viewState variable, a string representing the
         * serialized state of the current element, and it's children.  When calling children, the component
         * should pass only a substring of the viewState, removing it's own section, in order to increase efficiency.
         *
         */
        render: function() {
            if (this.visible == true) {

                // Dock starting from the top of the hierarchy down, then render children...
                this.dock.call(this);

                for (var componentId in this.children) {
                    if (componentId !== undefined)
                        this.children[componentId].render();
                }

                // Disable a default update.  If we have a read triggered, the incoming data should force this.
                // Otherwise, it overwrites attribute / prop settings that don't need model interaction
//                // Update the component from the model (we may not have used our default value
//                this.onModelChanged();
            } else {
                if (this.template != undefined) {
                    this.dom.hide();
                }
            }
        },

        /**
         * Returns the viewstate of this component.  A component should only have a contribution if it
         * plays a role in conditional GUI display (pages, tab controls, media players, etc).  For the actual content
         * of a control, the model state is determinant.
         *
         * @return {String}
         */
        getViewState: function() {
            var stateId = '';
            if (this.viewStateId !== undefined && this.viewStateId != '') {
                stateId = this.viewStateId;
            }
            for (var componentId in this.children) {
                var childState = this.children[componentId].getViewState();
                if (childState != '')
                    stateId += ':' + childState;
            }
            return stateId;
        }
    });

    /**
     *
     * @param event
     * @return {*}
     */
    Cajeta.View.Component.htmlEventDispatch = function(event) {
        return event.data.that[event.data.fnName].call(event.data.that, event);
    };

    /**
     *
     *
     */
    Cajeta.View.Page = Cajeta.View.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.title === undefined)
                this.title = Cajeta.constants.DEFAULT_PAGETITLE;
            this.setElementType('body');
        },
        setTitle: function(title) {
            this.title = title;
        },
        getTitle: function() {
            return this.title;
        },
        updateBrowserTitle: function() {
            document.title = this.title;
        },

        dock: function() {
            $('body').html(this.template);
        },

        getViewState: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            var viewState = self.super.getViewState.call(this, self.super);
            return (viewState != '' ? this.getCanonicalId() : this.getCanonicalId() + ':' + viewState);
        },

        /**
         * See Cajeta.Component.render for documentation on this method.
         */
        render: function() {
            this.super.render.call(this, this.super);
            this.updateBrowserTitle();
        }
    });

    /**
     *
     *
     */
    Cajeta.Application = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties);
            this.viewStateAliasMap = new Object();
            this.anchor = '';
            this.viewStateId = '';
            this.modelStateId = '';

            if (this.model === undefined) {
                this.model = new Cajeta.Model.ModelCache({
                    enableHistory: true,
                    enableJsonDelta: true
                });
            }

            this.componentMap = new Object();
            this.stringResourceMap = new Object();
            this.currentPage = null;
            this.executing = false;
        },

        /**
         * Returns the current anchor state of the application, a string encoding both view and model state.
         * Override this to provide platform appropriate logic.
         *
         * @return {String}
         */
        getUrlAnchor: function() {
            return window.location.hash;
        },

        setUrlAnchor: function(anchor) {
            window.location.hash = anchor;
        },

        /**
         * Called after all application initialization has been performed.  These tasks may include population
         * of all components and initialization of model state.  The application logic will also check for the
         * current anchor for additional state information.
         */
        execute: function() {
            if (this.executing == false) {
                if ("onhashchange" in window) { //&& !($.browser.msie)) {
                    window.onhashchange = Cajeta.Application.onAnchorChanged;
                } else {
                    // Quick and dirty to detect anchor hash change for primitive browsers
                    var prevHash = window.location.hash;
                    window.setInterval(function () {
                        if (window.location.hash != prevHash) {
                            Cajeta.Application.onAnchorChanged();
                        }
                    }, 200);
                }
                this.executing = true;
                this.anchor = this.getUrlAnchor();

                // If we have a page request without an anchor, set it to the defaults
                // for the application, and populate the (browser's) url with the anchor,
                // bootstrapping the render.
                if (this.anchor === undefined || this.anchor == '') {
                    var viewStateId = Cajeta.View.homePage;
                    this.anchor = viewStateId;

                    if (this.model !== undefined && this.model.enableHistory == true) {
                        this.modelStateId = this.model.getStateId();
                        this.anchor += '=' + this.modelStateId;
                    }
                    this.setUrlAnchor(this.anchor);
                } else {
                    // We have recieved a url with an anchor.  Directly call onAnchorChange to
                    // bootstrap the state change, and render
                    this.onAnchorChanged();
                }
            }
        },

        /**
         * Called when the browser or container URL is changed
         */
        onAnchorChanged: function() {
            var urlAnchor = this.getUrlAnchor();
            if (urlAnchor !== undefined && urlAnchor != '') {
                if (this.viewStateAliasMap.hasOwnProperty(urlAnchor)) {
                    this.anchor = this.viewStateAliasMap[urlAnchor];
                }
                this.anchor = urlAnchor;

                // First, ensure it's valid
                var states = urlAnchor.split('=');
                this.setViewStateId(states[0].substring(1), true);
                var validAnchor = "#" + this.viewStateId;
                var validModelId;
//                if (this.model.isHistoryEnabled()) {
//                    if (states.length > 1) {
//                        this.setModelStateId(states[1]);
//                        validModelId = this.model.getStateId();
//                    } else if (this.model.isHistoryEnabled() == true) {
//                        validModelId = this.modelStateId = this.model.getStateId();
//                    }
//                    validAnchor += '=' + validModelId;
//                }

                // Prevent bogus data in the anchor
                if (this.anchor != validAnchor) {
                    this.viewStateAliasMap[this.anchor] = validAnchor;
                    this.anchor = validAnchor;
                }
            } else {
                // The url was incorrectly modified.  Go back to default state
                this.setUrlAnchor(Cajeta.View.homePage + "=" + this.model.getStateId());
            }
        },

        /**
         * Called with the model is updated
         */
        onModelChanged: function() {
            this.anchor = '#' + this.viewStateId + '=' + this.model.getStateId();
            this.setUrlAnchor(this.anchor);
        },

        /**
         * Returns the instance of the data model for the application.
         *
         * @return Cajeta.Model
         */
        getModel: function() {
            return this.model;
        },

        /**
         * The top level render call, invoked by the script receiving the request.  The anchor of the url
         * will be used by the component hierarchy to determine how to render the application.  The form of
         * the url, and the anchor will be:
         *
         * [COMPONENT_ID][*:[COMPONENT_ID]][?=[MODEL_STATE]]
         *
         *  The entire anchor constitutes an application component state by defining both view and model,
         *  and optionally, the state of any controls or settings  within a component.  The block is generated
         *  by serializing each component in a depth-first iteration where each component  provides it's component
         *  ID.  From this, each component can know the state of it's children, and render an arbitrary
         *  application state from a request.  The optional state hash can either be directly interpreted as data
         *  (for simple cases), or be used as a key into an existing database, cookie, or remote service to
         *  recall larger datasets.
         *
         */
        render: function() {
            try {
                this.currentPage.render();
            } catch(e) {
                //Cajeta.log.error(e);
            }
        },

        getComponentMap: function() {
            return this.componentMap;
        },

        /**
         * Add a page to the application.
         *
         * @param page The page to add
         */
        addPage: function(page) {
            this.componentMap[page.getComponentId()] = page;
            if (this.currentPage == null) {
                this.currentPage = page;
            }
        },

        /**
         *
         * @param page
         * @param fromUrl
         */
        setCurrentPage: function(page, fromUrl) {
            var component;
            if (page instanceof Cajeta.View.Component) {
                component = page;
            } else {
                component = this.componentMap[page];
            }

            if (component === undefined)
                throw Cajeta.constants.ERROR_APPLICATION_PAGE_UNDEFINED.format(page);

            if (this.currentPage !== undefined) {
                if (this.currentPage != component) {
                    this.currentPage.undock();
                    this.currentPage = component;
                }
            } else {
                this.currentPage = component;
            }
        },

        /**
         *
         * @param viewStateId
         * @param fromUrl
         */
        setViewStateId: function(viewStateId, fromUrl) {
            // If the sequence was URL driven, we communicate the state to the view...
            if (fromUrl !== undefined && fromUrl == true) {
                var page;
                // Distribute the viewState over the components...
                var viewStateEntries = viewStateId.split(':');
                for (var i = 0; i < viewStateEntries.length; i++) {
                    var componentState = viewStateEntries[i].split('.');
                    var component = this.componentMap[componentState[0]];
                    if (component !== undefined) {
                        if (componentState.length > 0) {
                            if (i == 0)
                                page = component;
                            if (componentState.length > 1)
                                component.setViewStateId(componentState[1]);
                        }
                    } else {
                        // We have an invalid viewStateId!  Set it to the homePage
                        viewStateId = Cajeta.View.homePage;
                        page = this.componentMap[viewStateId];
                        break;
                    }
                }
                if (this.viewStateId != viewStateId) {
                    this.viewStateId = viewStateId;
                    if (page != this.currentPage)
                        this.setCurrentPage(page, fromUrl);
                    this.render();
                }
            } else {
                // Otherwise, that state already exists in the view, and all that needs to be done is
                // update the internal variable and the URL.
                this.viewStateId = viewStateId;
                this.anchor = '#' + this.viewStateId;
                if (this.modelStateId != '') {
                    this.anchor += '=' + this.modelStateId;
                }
                this.setUrlAnchor(this.anchor);
            }
        },

        /**
         *
         * @param modelState
         */
        setModelStateId: function(modelState) {
            this.modelStateId = modelState;
            this.model.loadState(this.modelStateId);
        },

        /**
         * Add an alias for a particular viewState.  This enables complex view state strings to be
         * substituted with human friendly aliases.
         *
         * @param alias
         * @param viewState
         */
        addViewStateAlias: function(alias, viewState) {
            this.viewStateAliasMap[alias] = viewState;
        },

        /**
         *
         * @param resourceId
         * @return {*}
         */
        getStringResource: function(resourceId) {
            return this.stringResourceMap[resourceId];
        },

        /**
         *
         * @param stringResourceMap
         */
        setStringResourceMap: function(stringResourceMap) {
            this.stringResourceMap = stringResourceMap;
        },

        /**
         *
         * @param locale
         * @param url
         */
        setStringResourceLocale: function(locale, url) {
            // Default behavior: execute XHR to retrieve the string resource map JSON from the server
            // at the provided url.  The returned result will be assumed to be in the proper format.
        }
    });

    /**
     *
     */
    Cajeta.Application.onAnchorChanged = function() {
        Cajeta.theApplication.onAnchorChanged();
    };

    return Cajeta;
});
