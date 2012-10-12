/**
 * cajeta.js
 *
 * Copyright (c) 2012 Julian Bach
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
            if (!Cajeta.Class.defining)
                if (this.initialize !== undefined)
                    this.initialize.apply(this, arguments);
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
        initialize: function(header, encoding) {
            this.header = header !== undefined ? header : {};
        },
        createAjax: function() {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            } else if (window.ActiveXObject) {
                return new ActiveXObject("MSXML2.XMLHTTP.3.0");
            }
        },
        onError: function(event) {
            console.log("An error occured: " + event);
        },
        exec: function(method, url, data, callback, header) {
            var ajax = this.createAjax();
            header = (header !== undefined) ? header : this.header;
            

            ajax.open(method, url, true);

            ajax.onerror = this.onError;

            if (callback !== undefined) {
                ajax.onreadystatechange = callback;
            }

            for (var name in header) {
                if (name !== undefined)
                    ajax.setRequestHeader(name, header[name]);
            }

            if (data !== undefined) {
                data = $.param(data, true);
                ajax.send(data);
            } else {
                ajax.send();
            }
        }
    });


// Declaration for namespace
    Cajeta.Cache = {};

    /**
     * Abstract base class for CacheStrategy.  The API defined here will be called by the framework in response
     * to Model updates.  Override these methods to hook up to local database, or even back end services.
     */
    Cajeta.Cache.AbstractCacheStrategy = Cajeta.Class.extend({
        initialize: function(cacheId) {
            this.cacheId = cacheId
        },
        put: function(key, value) { alert('This abstract method must be overridden.'); },
        get: function(key) { alert('This abstract method must be overridden.'); return null; },
        del: function(pattern) { }
    });

    /**
     * DefaultCacheStrategy will attempt to store information as a cookie, and if cookies aren't
     * enabled, in-memory. If single url function is acceptable (games, local content editors, etc),
     * then this implementation should suffice. If possible lack of cookie support is an issue,
     * then subclassing AbstractCacheStrategy to provide server interaction is recommended.
     */
    Cajeta.Cache.DefaultCacheStrategy = Cajeta.Cache.AbstractCacheStrategy.extend({
        initialize: function(cacheId) {
            var self = arguments.length > 1 ? arguments[1] : this;
            self.super.initialize.call(this, cacheId);
            if (!jCookies.test())
                this.cache = new Object();
        },
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

    Cajeta.Cache.ModelHistoryEntry = Cajeta.Class.extend({
        initialize: function(stateId, jsonDelta, model) {
            this.stateId = stateId;
            this.jsonDelta = jsonDelta;
            if (model !== undefined)
                this.modelCopy = $.extend(true, {}, model);
        },
        getStateId: function() {
            return this.stateId;
        },
        getJsonDelta: function() {
            return this.jsonDelta;
        },
        getModelCopy: function() {
            return this.modelCopy;
        }
    });

    /**
     * Cajeta.Model provides container services for an application's data model.  These services include storage of the
     * current image, associating an image with a state ID, managing image history through delta compression, and
     * component binding and notification.
     */
    Cajeta.Model = Cajeta.Class.extend({
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
            this.enableHistory = (properties.enableHistory !== undefined) ? properties.enableHistory : false;
            this.documentName = properties.documentName !== undefined ? properties.documentName : 'app';
            this.pathMap = new Object();
            this.dataMap = new Object();
            this.cacheStrategy = new Cajeta.Cache.DefaultCacheStrategy(this.documentName);
            if (properties.enableSession !== undefined && properties.enableSession)
                this.sessionId = new Date().getTime();
            else
                this.sessionId = '';

            this.versionId = 0;

            if (this.enableHistory) {
                this.stateId = (this.enableSession) ? this.sessionId + '.' : '';
                this.stateId += this.versionId;
            } else {
                this.stateId = '';
            }
            this.enableJsonDelta = (properties.enableJsonDelta !== undefined) ? properties.enableJsonDelta : false;
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

        /**
         * True, if history is enabled
         * @return {*}
         */
        isHistoryEnabled: function() {
            return this.enableHistory;
        },

        clearHistory: function(documentName) {
            if (documentName === undefined)
                documentName = 'app';
            this.cacheStrategy.del(documentName);
        },

        /**
         * Call this method with an object to update and save the model with a key value pair.
         * When called, the following logic will be executed:
         *
         * 1.  The changes to the model are committed
         * 2.  A new version ID is computed for the Model state.
         * 3.  After which, the udpated model is exported to JSON.
         * 4.  The delta between models is computed, and the delta to the previous version is stored on the history stack
         * 5.  The object will be recursively iterated to evaluate all children.
         * 6.  For each child, a check will be made to see if the entry for that node exists in the bindMap
         * 7.  If the entry exists, the reference to the current object is updated, and the bindMap
         *
         * @param key
         * @param value
         * @param committor
         */
        set: function(key, value, committor) {
            this.createSnapshot();
            this.dataMap[key] = value;
            this.onModelChanged(key, committor);
        },

        /**
         * Returns a data tree (an entire tree), from the map.
         *
         * @param key
         * @return {*}
         */
        get: function(key) {
            return this.dataMap[key];
        },

        /**
         * Set the value of an object in the model graph.  The model graph consists of a map of objects, each
         * essentially a tree. Model paths consist of a series of property names, seperated by dots.
         * Paths start with the key used to store a tree in the Model.  From there, the route is evaluated
         * to the final element, where the value is applied as previousLookup[finalElement] = value.  After invocation
         * the binding map is checked to see if any ModelEntries are dependent.  If so, their onModelUpdate methods
         * are triggered, causing values to be populated into the view.
         *
         * @param modelPath
         * @param value
         * @param committor
         */
        setByPath: function(modelPath, value, committor) {
            var paths = modelPath.split('.');
            var obj = this.dataMap[paths[0]], temp;
            for (var i = 1; i < paths.length - 1; i++) {
                temp = obj[paths[i]];
                obj = temp;
            }
            this.createSnapshot();
            obj[paths[i]] = value;
            this.onModelChanged(modelPath, committor);

        },

        /**
         * Return an object node in a data tree using a path address.
         *
         * @param modelPath
         */
        getByPath: function(modelPath) {
            if (modelPath === undefined)
                throw 'Invalid modelPath ' + modelPath;

            var paths = modelPath.split('.');
            var obj = this.dataMap[paths[0]];
            if (obj !== undefined) {
                var temp;
                for (var i = 1; i < paths.length; i++) {
                    temp = obj[paths[i]];
                }
            }
            return temp;
        },

        /**
         * Bind a component to the data model.  Changes to the data model (using setters defined here)
         * will result in updates to dependent components.
         *
         * @param component
         */
        bindComponent: function(component) {
            var modelPath = component.getModelPath();
            if (modelPath != undefined) {
                var paths = modelPath.split('.');

                // The binding map will keep entries both according to a dataMap key, as well as
                // by entire path.  This will facilitate both the update of components due to the
                // change of entire map entry, as well as an individual subnode.
                var components = this.pathMap[paths[0]];
                if (components == undefined) {
                    components = new Object();
                    this.pathMap[paths[0]] = components;
                }
                components[component.getComponentId()] = component;

                components = this.pathMap[modelPath];
                if (components == undefined) {
                    components = new Object();
                    this.pathMap[modelPath] = components;
                }
                components[component.getComponentId()] = component;

                // Ensure that there's a dataMap entry to satisfy the binding...
                var obj = this.dataMap[paths[0]];
                var temp = null;
                if (obj == undefined) {
                    obj = new Object();
                    this.dataMap[paths[0]] = obj;
                }
                for (var i = 1; i < paths.length - 1; i++) {
                    temp = obj[paths[i]];
                    if (temp == undefined) {
                        temp = new Object();
                        obj[paths[i]] = temp;
                    }
                    obj = temp;
                }
                // If there's no current value, use the default provided by the component
                if (obj[paths[i]] === undefined)
                    obj[paths[i]] = component.getDefaultValue();
            }
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
                    delete components[component.getComponentId()];

                components = this.pathMap[modelPath];
                if (components !== undefined)
                    delete components[component.getComponentId()];
            }
        },

        getStateId: function() {
            return this.stateId;
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
                    for (var componentId in components) {
                        var component = components[componentId];
                        if (component != undefined && component != committor)
                            component.onModelUpdate();
                    }
                }
            } else {
                for (var name in this.pathMap) {
                    var components = this.pathMap[name];
                    if (components != undefined) {
                        for (var componentId in components) {
                            var component = components[componentId];
                            //if (committor !== undefined && component != committor)
                            component.onModelUpdate();
                        }
                    }
                }
            }
        },

        createSnapshot: function() {
            if (this.enableHistory == false)
                return;

            var cacheEntry;
            if (this.enableJsonDelta == true) {
                var updatedModelJson = JSON.stringify(this.dataMap);
                var jsonDelta = vcd.encode(updatedModelJson, this.modelJson);
                this.modelJson = updatedModelJson;
                cacheEntry = new Cajeta.Cache.ModelHistoryEntry(this.stateId, jsonDelta, null);
            } else {
                cacheEntry = new Cajeta.Cache.ModelHistoryEntry(this.stateId, null, this.dataMap);

            }
            this.cacheStrategy.put(this.stateId, cacheEntry);

            this.stateId = (this.enableSession) ? this.sessionId + '.' : '';
            this.stateId += ++this.versionId;
        },

        onModelChanged: function(modelPath, committor) {
            this.updateBoundComponents(modelPath, committor);
            Cajeta.theApplication.onModelChanged(this.stateId);
        },

        /**
         * Change the model to the history state indicated by stateId
         *
         * @param stateId The id of the history snapshot to restore and make current
         */
        loadState: function(stateId) {
            // First, check to see that the session ID matches our current...
            if (stateId == this.stateId)
                return;

            var dotIndex = stateId.indexOf('.');
            var sessionId = stateId.substring(0, dotIndex);
            if (sessionId == this.sessionId) {
                var versionId = stateId.substring(dotIndex + 1);
                if (versionId > this.versionId) {
                    stateId = this.stateId;
                    return;
                }

                // Store the current model before loading a previous version, if it's not a
                // snapshot...
                if (this.cacheStrategy.hasOwnProperty(this.getStateId()) == false) {
                    this.createSnapshot();
                }

                // We're going backward, so set the state ID to that requested
                this.stateId = stateId;

                var entryToRestore = this.cacheStrategy.get(stateId);
                if (entryToRestore !== undefined) {
                    // Save state as a copy, not a delta, if it's not already in our map...
                    if (this.cacheStrategy.get(this.stateId) == undefined)
                        this.cacheStrategy.put(this.stateId, new Cajeta.Cache.ModelHistoryEntry(this.stateId,
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
            }
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
            this.modelPath = properties.modelPath === undefined ? this.componentId : properties.modelPath;
            this.parent = null;
            this.attributes = new Object();
            this.properties = new Object();
            this.cssAttributes = new Object();
            this.children = new Object();
            this.hotKeys = new Object();
            this.viewStateId = '';
            this.domEventBound = false;
            if (this.visible === undefined)
                this.visible = true;
        },
        setComponentId: function(componentId) {
            this.componentId = componentId;
        },
        getComponentId: function() {
            return this.componentId;
        },
        setDefaultValue: function(defaultValue) {
            this.defaultValue = defaultValue;
        },
        getDefaultValue: function() {
            return this.defaultValue;
        },
        setValue: function(value) {
            this.dom.attr('value', value);
        },
        getValue: function() {
            return this.dom.attr('value');
        },
        setElementType: function(elementType) {
            this.elementType = elementType;
        },
        getElementType: function() {
            return this.elementType;
        },
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
        setModelPath: function(modelPath) {
            this.modelPath = modelPath;
        },
        getModelPath: function() {
            return this.modelPath;
        },
        addChild: function(component) {
            var componentId = component.getComponentId();
            if (componentId == undefined || componentId == '') {
                throw 'A component must have a valid componentId to be added as a child';
            }
            this.children[componentId] = component;
            component.parent = this;
        },
        removeChild: function(componentId) {
            if (this.children[componentId] !== undefined) {
                this.children[componentId].undock();
                delete this.children[componentId];
            }
        },
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
        reset: function() {

        },
        onModelUpdate: function() {
            if (this.isDocked() && this.modelPath) {
                this.setValue(Cajeta.theApplication.getModel().getByPath(this.modelPath));
            }
        },
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
        setViewStateId: function(viewState) {

        }
    });

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
     * @type {*}
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
     * @type {Function}
     */
    Cajeta.Application = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties);
            this.viewStateAliasMap = new Object();
            this.anchor = '';
            this.viewStateId = '';
            this.modelStateId = '';

            // Use history, but not session or JSON delta compression
            this.model = new Cajeta.Model({
                enableHistory: true,
                enableSession: false,
                enableJsonDelta: false,
                documentName: 'testApp'
            });
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
                if (("onhashchange" in window) && !($.browser.msie)) {
                    window.onhashchange = Cajeta.Application.onAnchorChanged;
                } else {
                    // Quick and dirty to detect anchor hash change for primitive browsers
                    var prevHash = window.location.hash;
                    window.setInterval(function () {
                        if (window.location.hash != prevHash) {
                            Cajeta.Application.onAnchorChanged;
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
