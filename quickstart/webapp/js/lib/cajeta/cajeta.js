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

    var Cajeta = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2012',
        theApplication: null
    };

    // JavaScript object model, based on prototype, but using some additional
    // strategies to enable polymorphism.
    Cajeta.Class = function() { };

    // A global flag to prevent the execution of constructors when defining
    // the object.
    Cajeta.Class.defining = new Boolean();

    /**
     *
     * @param definition
     * @return {*}
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

    Cajeta.Ajax = Cajeta.Class.extend({
        initialize: function(properties) {
            this.header = properties.header !== undefined ? header : {};
            // TODO utilize encoding
        },
        createHxr: function() {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                return new ActiveXObject("MSXML2.XMLHTTP.3.0");
            }
        },
        onError: function(event) {
            console.log("An error occured: " + event);
        },
        exec: function(method, url, data, callback, headers) {
            var hxr = this.createHxr();
            var headers = (headers !== undefined) ? headers : this.headers;
            

            hxr.open(method, url, true);
            hxr.onerror = this.onError;

            if (callback !== undefined) {
                hxr.onreadystatechange = callback;
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

    Cajeta.Model.StateEntry = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties);
            if (this.id === undefined)
                throw "ModelHistoryEntry constructor requires stateId property";
            if (this.model === undefined)
                this.model = $.extend(true, {}, Cajeta.theApplication.cache);
        },
        getId: function() {
            return this.id;
        },
        getJsonDelta: function() {
            return this.jsonDelta;
        },
        getModelCopy: function() {
            return this.modelCopy;
        }
    });

    Cajeta.Model.stateCache = new Object();

    Cajeta.Model.AbstractDatasourceAdaptor = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties);
            if (this.id === undefined)
                throw 'Cajeta.Model.AbstractDatasourceAdaptor.id is undefined.';
        },
        getId: function() {
            return this.id;
        },
        setComponent: function(component) {
            this.component = component;
        },
        put: function(data) { throw 'Cajeta.Model.AbstractEndpointAdaptor.put requires an implementation'; },
        get: function() { throw 'Cajeta.Model.AbstractEndpointAdaptor.get requires an implementation'; },
        del: function() { throw 'Cajeta.Model.AbstractEndpointAdaptor.del requires an implementation'; },
    });

    /**
     * An adaptor class used by model entries to interace with a data source.
     * API methods are designed to support REST based communication.
     */
    Cajeta.Model.AbstractRestAdaptor = Cajeta.Model.AbstractDatasourceAdaptor.extend({
        /**
         * The properties argument for the adaptor must contain an entry for the model.  Any data returned from get
         * or post methods will be stored in the model.
         * @param properties
         */
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);

            if (this.uriTemplate === undefined) {
                throw 'Cajeta.Model.AbstractRestAdaptor.uriTemplate is undefined.';
            }
        },
        post: function(data) { throw 'Cajeta.Model.AbstractEndpointAdaptor.post requires an implementation'; },
        onComplete: function(data) { throw 'Cajeta.Model.AbstractEndpointAdaptor.onComplete requires an implementation'; },

        /**
         * This method takes the uriTemplate assigned to this object and parses it for references to ids.
         * These ids are assumed to reference elements in the application cache.
         * @return {*}
         */
        uri: function() {
            var result = this.uriTemplate;
            var startIndex = result.indexOf('{');

            while (startIndex >= 0) {
                var endIndex = result.indexOf('}');
                var key = result.substring(startIndex + 1, endIndex - 1);
                result = result.replace('{' + key + '}', Cajeta.Model.stateCache[key]);
                startIndex = result.indexOf('{');
            }

            return result;
        }
    });

    Cajeta.Model.MemoryDatasourceAdaptor = Cajeta.Model.AbstractDatasourceAdaptor.extend({
        intialize: function(properties) {
            var self = (properties.super === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(self.super, properties);
        },
        put: function(data) { Cajeta.theApplication.cache[this.id] = data },
        get: function() { return this.component.update(Cajeta.theApplication.cache[this.id]); },
        del: function() { delete Cajeta.theApplication.cache[this.id]; }
    });

    Cajeta.Model.HttpRestAdaptor = Cajeta.Model.AbstractRestAdaptor.extend({
        initialize: function(properties) {
            var self = properties.self === undefined ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(self.super, properties);
            this.ajax = new Cajeta.Ajax();
            if (!this.uri().contains('http'))
                throw 'Cajeta.Model.AbstractRestAdaptor.uri must be a valid url';
        },
        put: function(data) {
            this.ajax.exec('PUT', this.url(), data, this.onComplete, this.headers);
        },
        get: function() {
            this.ajax.exec('GET', this.url(), null, this.onComplete, this.headers);
        },
        post: function(data) {
            this.ajax.exec('POST', this.url(), data, this.onComplete, this.headers);
        },
        del: function() {
            this.ajax.exec('DELETE', this.url(), null, this.onComplete, this.headers);
        },
    });

    /**
     * Cajeta.Model provides container services for an application's data model.  These services include storage of the
     * current image, associating an image with a state ID, managing image history through delta compression, and
     * component binding and notification.
     */
    Cajeta.Model.Cache = Cajeta.Class.extend({
        /**
         * Supported attributes:
         *      enableHistory:  Enables the ability of applications to keep a history of model state,
         *                      which allows for either component-state based undo, or navigation
         *      documentName:   Allows applications to manage multiple discrete model states, each representing
         *                      a separate 'document'
         *      enableSession:  Generates unique session IDs for access, and ensures that urls for one session
         *                      are not used for another.  Without sessions, applications have a timeless and
         *                      locationless state that *may* be shared between instances.  The latter is
         *                      highly dependent on implementation.
         * @param properties
         */
        initialize: function(properties) {
            $.extend(this, properties);
            if (this.cache === undefined)
                throw "Constructor properties for AbstractDataSource must provide a dataSourceId";

            this.cacheReads = false;
            this.readCache = new Object();
            this.appName = this.appName !== undefined ? this.appName : 'app';
            this.pathMap = new Object();
            this.dataMap = new Object();
            this.dataSourceMap = new Object();

            // Check to see if we've been initialized, if not, see if we have a stateId stored as a cookie.
            // Otherwise, initialize to 0
            if (this.id === undefined) {
                this.id = jCookies.get("id");
                if (this.id === undefined || this.id === null)
                    this.id = 0;
            }

            this.versionId = 0;

            if (this.stateRestAdaptor === undefined) {
                this.stateRestAdaptor = new Cajeta.Model.MemoryRestAdaptor({});
            }

            if (this.enableJsonDelta === undefined) this.enableJsonDelta = false;

            this.modelJson = null;
            this.vcd = null;
            if (this.enableJsonDelta == true) {
                this.modelJson = JSON.stringify(this.dataMap);
                this.vcd = new Diffable.Vcdiff();
                this.vcd.blockSize = 3;
            }
            this.maxHistorySize = 30;
            this.historySize = 0;
        },

        addDataSource: function(dataSource) {
            this.dataSourceMap[dataSource.getId()] = dataSource;
        },

        getDataSource: function(id) {
            return this.dataSourceMap[id];
        },



        /**
         * True, if history is enabled
         * @return {*}
         */
        isHistoryEnabled: function() {
            return this.enableHistory;
        },

        saveState: function(stateId) {
            if (this.enableHistory == false)
                return;

            var cacheEntry;
            if (this.enableJsonDelta == true) {
                var updatedModelJson = JSON.stringify(this.dataMap);
                var jsonDelta = vcDiff.encode(updatedModelJson, this.modelJson);
                this.modelJson = updatedModelJson;
                cacheEntry = new Cajeta.Model.StateEntry(this.id, jsonDelta, null);
            } else {
                cacheEntry = new Cajeta.Model.StateEntry(this.id, null, this.dataMap);

            }
            this.stateRestAdaptor.put(cacheEntry);
            this.id = ++this.versionId;
            Cajeta.Model.stateCache['id'] = this.id;
        },

        /**
         * Change the model to the history state indicated by stateId
         *
         * @param stateId The id of the history snapshot to restore and make current
         */
        loadState: function(stateId) {
            // First, check to see that the session ID matches our current...
            if (stateId == this.id)
                return;

            // We're going backward, so set the state ID to that requested
            this.id = stateId;
            this.stateRestAdaptor.onComplete = this.onStateReadComplete;
            this.stateRestAdaptor.get(stateId);
        },

        /**
         * TODO FIGURE THIS OUT!
         * @param data
         */
        onStateReadComplete: function(data) {
            var entryToRestore = data;
            if (entryToRestore !== undefined) {
                // Save state as a copy, not a delta, if it's not already in our map...
                if (this.cacheStrategy.get(stateId) == undefined)
                    this.cacheStrategy.put(stateId, new Cajeta.Cache.PageHistoryEntry(this.id,
                        null, $.extend(true, {}, this.dataMap)));
                if (entryToRestore.modelCopy != null) {
                    this.dataMap = entryToRestore.modelCopy;
                } else {
                    // Figure this out:  json delta recovery
                    // Algorithm:  Start at our versionId, and iterate over the set of cache entries until we find one
                    // with an intact model.  Then, generate the complete JSON from that.  Finally, iterate down to our current
                    // image, applying the deltas for each.  Finally, convert the resulting JSON back into a model
                }
                this.updateBoundComponents();
            }
        },

        /**
         * TODO FIGURE THIS OUT!!!
         * @param documentName
         */
        clearAll: function(documentName) {
            if (documentName === undefined)
                documentName = 'app';
            this.del(documentName);
        },

        deleteState: function(stateId) {
            this.stateRestAdaptor.del(stateId);
        },


        /**
         *
         * @param enable
         * @return {Function}
         */
        batchReads: function(enable) {
            if (enable !== undefined) {
                // If we've been caching, and are turning it off, we read whatever we've collected so far...
                if (enable == false && this.cacheReads == true) {
                    this.read(this.readCache);
                }
                this.cacheReads = enable;
            } else {
                return this.cacheReads;
            }
        },


        /**
         * Call this method to invoke an update when either reading or writing data.  For writing data, provide
         * a value and, optionally, a committor parameter to prevent cyclical bind calls.
         *
         * For reading data, provide only the key value.  A read will be executed (allowing subclassed overrides
         * to implement transport), followed by an onModelChanged call to force bound components to update.
         *
         * During the render phase, read requests are cached and executed as a batch.
         *
         * @param key The key identifying the data.  This may be either a string id (which should be in canonical
         *        format, or a component.  For writes, committing components will not receive update notifications,
         *        preventing cycles.
         * @param value The optional value to assign to the key.
         */
        update: function(key, value) {
            var id = '';
            var component = null;
            if (key instanceof Cajeta.View.Component) {
                id = key.getModelPath();
                component = key;
            } else {
                id = key;
            }
            if (value !== undefined) {
                this.write(id, value);
            } else {
                if (this.cacheReads == false) {
                    this.read(id);
                } else {
                    if (key.contains('.')) {
                        var paths = key.split('.');
                        var obj = this.readCache;
                        for (var i = 0; i < paths.length - 1; i++) {
                            obj = obj[paths[i]];
                            if (obj !== undefined) {
                                var temp;
                                for (var i = 1; i < paths.length; i++) {
                                    temp = obj[paths[i]];
                                }
                            } else {
                                obj[paths[i]] = new Object();
                                obj = obj[paths[i]];
                            }
                        }
                        obj[paths[paths.length - 1]] = "update";
                    }
                }
            }
        },

        /**
         * This method should be overridden to provide actual logic for accessing data sources
         *
         * @param key
         */
        read: function(key) {
            this.onModelChanged(key);
        },

        /**
         *
         * @param key
         * @param value
         */
        write: function(key, value) {
            this.onModelChanged(key, value);
        },

        /**
         * Bind a component to the data model.  Changes to the data model (using setters defined here)
         * will result in updates to dependent components.
         *
         * @param component
         */
        bindComponent: function(component) {
            var modelPath = component.getModelPath();
            var paths = modelPath.split('.');

            // The binding map will keep entries both according to a dataMap key, as well as
            // by entire path.  This will facilitate both the update of components due to the
            // change of entire map entry, as well as an individual subnode.
            var components = this.pathMap[paths[0]];
            if (components === undefined) {
                components = new Object();
                this.pathMap[paths[0]] = components;
            }
            components[component.getCanonicalId()] = component;

            components = this.pathMap[modelPath];
            if (components === undefined) {
                components = new Object();
                this.pathMap[modelPath] = components;
            }
            components[component.getCanonicalId()] = component;

            // Ensure that there's a dataMap entry to satisfy the binding...
            var obj = this.dataMap[paths[0]];
            var temp = null;
            if (obj === undefined) {
                obj = new Object();
                this.dataMap[paths[0]] = obj;
            }

            for (var i = 1; i < paths.length - 1; i++) {
                temp = obj[paths[i]];
                if (temp === undefined) {
                    temp = new Object();
                    obj[paths[i]] = temp;
                }
                obj = temp;
            }
            // If there's no current value, use the value of the component
            if (obj[paths[i]] === undefined)
                obj[paths[i]] = component.getValue();
        },

        /**
         * Release the component.  Components are released, by default, when they are undocked from
         * the DOM to prevent unnecessary updates
         *
         * @param component  The component to unbind from the model
         */
        releaseComponent: function(component) {
            var modelPath = component.getModelPath();
            if (modelPath !== undefined && modelPath != null) {
                var paths = component.getModelPath().split('.');
                var components = this.pathMap[paths[0]];
                if (components !== undefined)
                    delete components[component.getCanonicalId()];

                components = this.pathMap[modelPath];
                if (components !== undefined)
                    delete components[component.getCanonicalId()];
            }
        },

        getStateId: function() {
            return this.id;
        },

        /**
         * Called in response to putValue to update the component model entries that are bound to values
         * in the provided object graph
         *
         * @param modelPath The path that was changed
         * @param committor Optional, passed in to avoid circular calls when changes are authored by components
         */
        updateBoundComponents: function(modelPath, committor) {
            if (modelPath !== undefined) {
                var components = this.pathMap[modelPath];
                if (components != undefined) {
                    for (var canonicalId in components) {
                        var component = components[canonicalId];
                        if (component != undefined && component != committor)
                            component.onModelUpdate();
                    }
                }
            } else {
                for (var name in this.pathMap) {
                    var components = this.pathMap[name];
                    if (components != undefined) {
                        for (var canonicalId in components) {
                            var component = components[canonicalId];
                            //if (committor !== undefined && component != committor)
                            component.onModelUpdate();
                        }
                    }
                }
            }
        },

        onModelChanged: function(modelPath, committor) {
            this.updateBoundComponents(modelPath, committor);
            Cajeta.theApplication.onModelChanged(this.id);
        }
    });

    Cajeta.Model.CacheAdaptor = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties, true);
            if (this.path === undefined)
                throw "Model.path must be defined";
        },

        onRead: function() {
            // Use the rules established here to read data from the cache, and

        },
        onWrite: function(data) {
            // Use the global scope cache (or provided cache) to
            // write out the data
        }


    });

    Cajeta.View = {
        homePage: 'homePage'
    };

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
            $.extend(this, properties);
            if (this.componentId === undefined)
                throw 'A componentId must be defined';
            this.modelPath = (this.modelPath === undefined) ? this.getCanonicalId() : this.modelPath;
            this.parent = null;
            this.attributes = this.attributes === undefined ? {} : this.attributes;
            this.properties = this.properties === undefined ? {} : this.properties;
            this.cssAttributes = this.cssAttributes === undefined ? {} : this.cssAttributes;
            this.children = new Object();
            this.hotKeys = new Object();
            this.viewStateId = '';
            this.domEventBound = false;
            if (this.visible === undefined)
                this.visible = true;
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

        /**
         *
         * @param value
         */
        value: function(value) {
            if (value !== undefined)
                this.attr('value', value);
            else
                return this.attr('value');
        },

        /**
         *
         * @return {*|String|String|String}
         */
        getElementType: function() {
            return this.elementType;
        },

        /**
         *
         * @param elementType
         */
        setElementType: function(elementType) {
            this.elementType = type;
        },

        /**
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
                }
                if (this.template !== undefined) {
                    this.template.css(name, value);
                }
                this.cssAttributes[name] = value;
            }
        },
        html: function(value) {
            if (value === undefined) {
                if (this.isDocked() !== undefined) {
                    return this.dom.html();
                } else if (this.template !== undefined) {
                    return this.template.html();
                } else
                    return this.html;
            } else {

                if (this.isDocked())
                    this.dom.html(value);
                if (this.template !== undefined)
                    this.template.html(value);

                this.html = value;
            }
        },

        /**
         *
         * @param modelPath
         */
        setModelPath: function(modelPath) {
            this.modelPath = modelPath;
        },

        /**
         *
         * @return {*}
         */
        getModelPath: function() {
            return this.modelPath;
        },

        /**
         *
         * @param component
         */
        addChild: function(component) {
            var componentId = component.getComponentId();
            if (componentId == undefined || componentId == '') {
                throw 'A component must have a valid componentId to be added as a child';
            }
            this.children[componentId] = component;
            if (component.endpointId === undefined) {
                component.endpointId = this.endpointId;
            }
            component.parent = this;
        },

        /**
         *
         * @param componentId
         */
        removeChild: function(componentId) {
            if (this.children[componentId] !== undefined) {
                this.children[componentId].undock();
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
                    delete this.children[name];
                }
            }
        },

        /**
         * A template may be assigned to a component, which will be used to override
         * the markup existing in the DOM. If no template has been assigned, the exsting markup
         * in the DOM will be used.  Templates nodes must be a direct child of the html parent.
         *
         * @param templateId The ID of the template
         * @param template The template source, may contain many templates.
         */
        setTemplate: function(templateId, template) {
            this.domEventBound = false;
            var temp = $(template);
            if (temp.length > 0) {
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i].attributes != undefined) {
                        var attrValue = temp[i].attributes['cajeta:templateId'];
                        if (attrValue == undefined) {
                            attrValue = temp[i].attributes['templateId'];
                        }

                        if (attrValue != undefined && attrValue.value == templateId) {
                            this.template = $(temp[i]);
                            this.template.attr('cajeta:componentId', this.componentId);
                            break;
                        }
                    }
                }
            }
            if (this.template === undefined) {
                throw 'Invalid template for ' + this.getComponentId() +
                    ', must contain an element with the attribute templateId having the value ' + templateId + '.';
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
                var domElement = $(type + '[cajeta\\:componentid = "' + this.componentId + '"]');
                if (domElement.length == 0) {
                    // Try again, without namespace
                    domElement = $(type + '[componentid = "' + this.componentId + '"]');
                    throw 'Dock failed: a component was not found with componentId "' + this.componentId + '".';
                } else if (domElement.length > 1) {
                    throw 'Dock failed: more than one component was found with componentId "' + this.componentId + '".';
                }
                if (this.template === undefined) {
                    this.dom = domElement;
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
                } else {
                    // Should replace with template, but this is blowing away a huge portion of the dom
                }

                // Finally, ensure we have assigned the component ID to the fragment
                this.attr('cajeta:componentId', this.componentId);

                // Add to the application component map at this point.
                Cajeta.theApplication.getComponentMap()[this.componentId] = this;

                // Bind the component to the model
                Cajeta.theApplication.getModel().bindComponent(this);
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
                this.domEventBound = false;
            }

            Cajeta.theApplication.getModel().releaseComponent(this);
        },

        /**
         * Binds the events generated by the html managed by this component to it's event handlers.
         * The logic follows a naming convention where methods named onHtml* will be bound to their corresponding
         * * events.  These include: change, mouseOver, mouseOut, focus, blur, and click.
         */
        bindHtmlEvents: function() {
            if (this.domEventBound == false) {
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
                this.domEventBound = true;
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
                Cajeta.theApplication.getModel().bindComponent(this);

                // Dock starting from the top of the hierarchy down, then render children...
                this.dock.call(this);

                for (var componentId in this.children) {
                    if (componentId !== undefined)
                        this.children[componentId].render();
                }

                this.bindHtmlEvents();

                // Update the component from the model (we may not have used our default value
                this.onModelUpdate();
            } else {
                if (this.template != undefined) {
                    this.dom.hide();
                }
            }
        },

        /**
         *
         */
        reset: function() {

        },

        /**
         *
         */
        onModelUpdate: function() {
            if (this.isDocked() && this.modelPath) {
                this.setValue(Cajeta.theApplication.getModel().getByPath(this.modelPath));
            }
        },

        /**
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
        },

        /**
         *
         * @param viewState
         */
        setViewStateId: function(viewState) {

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


    Cajeta.View.ComponentGroup = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.defaultValue !== undefined)
                this.value = this.defaultValue;
        },
        onModelUpdate: function() {
            this.value =  Cajeta.theApplication.getModel().getByPath(this.modelPath);
            // iterate through our set of children, looking for the value attribute of children.
            // The one that matches our current value gets set.
            for (var name in this.children) {
                if (name !== undefined) {
                    if (this.children[name].dom.attr('value') == this.value) {
                        this.children[name].dom.prop('checked', true);
                    }
                }
            }
        },
        onChildChange: function(event) {
            if (this.modelPath !== undefined) {
                this.value = event.target.getAttribute('value');
                if (this.value === undefined)
                    throw 'Error: A ComponentGroup change event resulted in an undefined model value.';
                Cajeta.theApplication.getModel().setByPath(this.modelPath, this.value, this);
            }
        },
        bindHtmlEvents: function() {
            if (this.domEventBound == false) {
                this.domEventBound = true;
                var eventData = new Object();
                eventData['that'] = this;
                eventData['fnName'] = 'onChildChange';
                for (var name in this.children) {
                    if (name !== undefined) {
                        this.children[name].dom.bind('change', eventData, Cajeta.View.Component.htmlEventDispatch);
                    }
                }
            }
        },
        /**
         * There will be no corresponding markup in the template to support groups, so we override dock...
         */
        dock: function() {
            if (!this.isDocked()) {
                // Add to the application component map at this point.
                Cajeta.theApplication.getComponentMap()[this.componentId] = this;

                // Bind the component to the model if we have a valid path
                if (this.modelPath !== undefined)
                    Cajeta.theApplication.getModel().bindComponent(this);
            }
        }
    });

    /**
     *
     *
     */
    Cajeta.View.Page = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.title === undefined)
                this.title = 'Default Cajeta Page';
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
            this.dom = $('body');

            // First, remove any children of body...
            this.dom.empty();
            this.dom.append(this.template);
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

            if (this.cache !== undefined) {
                this.cache = new Cajeta.Model.Cache({
                    enableHistory: true,
                    enableSession: false,
                    enableJsonDelta: false,
                    appName: 'testApp'
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
                    this.modelStateId = this.model.getStateId();
                    this.anchor = viewStateId;
                    if (this.modelStateId != '') {
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
                if (this.model.isHistoryEnabled()) {
                    if (states.length > 1) {
                        this.setModelStateId(states[1]);
                        validModelId = this.model.getStateId();
                    } else if (this.model.isHistoryEnabled() == true) {
                        validModelId = this.modelStateId = this.model.getStateId();
                    }
                    validAnchor += '=' + validModelId;
                }
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
            this.currentPage.render();
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
                throw 'An invalid argument was used in Cajeta.Application.addPage: ' + page;

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
