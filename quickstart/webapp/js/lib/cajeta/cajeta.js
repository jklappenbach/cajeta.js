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
        license: 'MIT 2012',
        theApplication: null
    };

    // JavaScript object model, based on prototype, but using some additional
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

    Cajeta.Datasource = {};

    Cajeta.Datasource.Ajax = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties);
            this.header == this.header !== undefined ? this.header : {};
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

        /**
         * Do nothing method.  Override if you want to store or act upon data results.
         * @param data
         */
        onComplete: function(data) {
        },

        exec: function(method, url, data, callback, headers) {
            var hxr = this.createHxr();
            var headers = (headers !== undefined) ? headers : this.headers;


            hxr.open(method, url, true);
            hxr.onerror = this.onError;

            if (callback !== undefined) {
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
            if (this.uriTemplate === null) {
                throw 'A "urlTemplate" property must be defined in the constructor';
            }
        },
        put: function(data) { throw 'Cajeta.Model.AbstractEndpointAdaptor.put requires an implementation'; },
        get: function() { throw 'Cajeta.Model.AbstractEndpointAdaptor.get requires an implementation'; },
        post: function(data) { throw 'Cajeta.Model.AbstractEndpointAdaptor.post requires an implementation'; },
        del: function() { throw 'Cajeta.Model.AbstractEndpointAdaptor.del requires an implementation'; },
        onComplete: function(data) { throw 'Cajeta.Model.AbstractEndpointAdaptor.onComplete requires an implementation'; },
        uri: function() {
            var result = this.uriTemplate;
            var startIndex = result.indexOf('{');

            while (startIndex >= 0) {
                var endIndex = result.indexOf('}');
                var key = result.substring(startIndex + 1, endIndex - 1);
                // TODO FIXME! result = result.replace('{' + key + '}', Cajeta.Model.theModelCache.modelCache[key]);
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
     * Centralized cache for Datasources
     *
     * @type {*}
     */
     Cajeta.Model.datasourceMap = new Object();

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
            $.extend(this, properties);
            this.modelJson = JSON.stringify(this.dataMap);
            this.vcd = new Diffable.Vcdiff();
            this.vcd.blockSize = 3;
            this.cache = {};
            this.stateId = 0;
            if (this.keyPeriod === undefined)
                this.keyPeriod = 10;
        },
        getId: function() {
            return this.stateId;
        },

        addState: function(model) {
            var json = JSON.stringify(model);
            if (this.stateId % this.keyPeriod > 0) {
                this.cache[this.stateId++] = this.vcd.encode(this.modelJson, json);

            } else {
                this.cache[this.stateId++] = json;
            }
            this.modelJson = json;
            return this.stateId;
        },

        /**
         * First, find the key frame, and then iterate to the desired ID, restoring along the way.
         *
         * @param snapshotId
         */
        restoreState: function(stateId) {
            var start = stateId - (stateId % this.keyPeriod);
            var json = this.cache[start];
            for (var i = start + 1; i <= stateId; i++) {
                json = this.vcd.decode(json, this.cache[i]);
            }
            this.stateId = stateId;
            return json;
        },

        /**
         * Clear all entries.
         *
         * @param snapshotId
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
    Cajeta.Model.ModelCache = Cajeta.Class.extend({
        /**
         * @param properties
         */
        initialize: function(properties) {
            $.extend(this, properties);

            if (this.application === undefined) {
                throw 'Cajeta.Model.application must be defined';
            }

            if (this.data == undefined) {
                this.data = new Object();
                // Associates a set of components with a node in the dataMap.  When a node is updated, check
                // this datastructure for components to notify
                this.data.componentMap = new Object();
                // Associates each node in the dataMap with its canonical path entry.  This allows
                // external actors (components via ModelAdaptors) to quickly access a dataMap node given
                // a canonical path
                this.data.pathMap = new Object();
                // Stores the actual data, as a set of connected graphs.  The 1st order associations are by
                // datasourceId.
                this.data.dataMap = new Object();
            }


            if (this.stateCache === undefined) {
                this.stateCache = new Cajeta.Model.StateCache({});
            }

            // Check to see if we've been initialized, if not, see if we have a stateId stored as a cookie.
            // Otherwise, initialize to 0
            // TODO Make sure that we use the StateCache to restore a state if we have a valid ID
            if (this.stateId === undefined) {
                this.stateId = jCookies.get("stateId");
                if (this.stateId === undefined || this.stateId === null)
                    this.stateId = 0;
            }

            if (this.autoSnapshot === undefined)
                this.autoSnapshot = false;
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

        },

        /**
         * Change the model to the history state indicated by stateId
         *
         * @param stateId The id of the history snapshot to restore and make current
         */
        loadState: function(stateId) {
            // First, check to see that the session ID matches our current...
            if (stateId == this.stateCache.getId())
                return;

            this.data = this.stateCache.restoreState(stateId);
            // TODO Need to notify the application that things have been updated.
        },

        /**
         * TODO Need to adjust this after the refactor!
         * @param data
         */
        onStateReadComplete: function(data) {
            throw 'Unimplemented!';
//            var entryToRestore = data;
//            if (entryToRestore !== undefined) {
//                // Save state as a copy, not a delta, if it's not already in our map...
//                if (this.stateCache.get(this.stateId) == undefined)
//                    this.stateCache.put(this.stateId, new Cajeta.Cache.PageHistoryEntry(this.id,
//                        null, $.extend(true, {}, this.data.dataMap)));
//                if (entryToRestore.modelCopy != null) {
//                    this.data.dataMap = entryToRestore.modelCopy;
//                } else {
//                    // Figure this out:  json delta recovery
//                    // Algorithm:  Start at our versionId, and iterate over the set of cache entries until we find one
//                    // with an intact model.  Then, generate the complete JSON from that.  Finally, iterate down to our current
//                    // image, applying the deltas for each.  Finally, convert the resulting JSON back into a model
//                }
//                this.updateBoundComponents();
//            }
        },

        /**
         * Recursive utility method to remove entries for an existing tree in the dataMap
         * @param path The starting canonical data path of the head to remove
         * @param data The existing child tree
         */
        removePathMapEntries: function(datasourceId, path, data) {
            var dsEntries = this.data.pathMap[datasourceId];
            if (dsEntries !== undefined) {
                delete dsEntries[path];
                if (!(data instanceof String)) {
                    for (var name in data) {
                        if (name !== undefined) {
                            this.removePathMapEntries(datasourceId, path + '.' + name, data[name]);
                        }
                    }
                }
            }
        },

        addPathMapEntries: function(datasourceId, path, data, componentSource) {
            var dsEntries = this.data.pathMap[datasourceId];
            if (dsEntries === undefined) {
                dsEntries = new Object();
                this.data.pathMap[datasourceId] = dsEntries;
            }

            dsEntries[path] = data;

            // While this is a little outside of the direct role of this method, we're
            // in the process of recursing through the set of new data nodes.  This is a
            // good place to notify components (after we've made the path entry for the node),
            // preventing duplicate transversals.
            var components = this.data.componentMap[path];
            for (var id in components) {
                if (id !== undefined) {
                    var component = components[id];
                    if (componentSource !== undefined && component != componentSource)
                        component.onModelUpdate();
                }
            }

            // Now, iterate through the children mapped by this node, and recurse.
            if (!(data instanceof String)) {
                for (var name in data) {
                    if (name !== undefined) {
                        this.addPathMapEntries(datasourceId, path + '.' + name, data[name]);
                    }
                }
            }
        },

        addDataMapEntry: function(datasourceId, path, data) {
            var dsEntries = this.data.dataMap[datasourceId];
            if (dsEntries === undefined) {
                dsEntries = new Object();
                this.data.dataMap[datasourceId] = dsEntries;
            }

            var paths = path.split('.');
            var parent = dsEntries;
            var child;
            for (var i = 0; i < paths.length - 2; i++) {
                child = parent[paths[i]];
                if (child === undefined) {
                    child = new Object();
                    parent[paths[i]] = child;
                }
                parent = child;
            }
            parent[paths[paths.length - 1]] = data;
        },

        removeDataMapEntry: function(datasourceId, path, data) {
            var dsEntries = this.data.dataMap[datasourceId];
            if (dsEntries !== undefined) {
                var paths = path.split('.');
                var parent = dsEntries;
                var child;
                for (var i = 0; i < paths.length - 2; i++) {
                    child = parent[paths[i]];
                    if (child === undefined) {
                        return;
                    }
                    parent = child;
                }
                delete parent[paths[paths.length - 1]];
            }
        },

        /**
         * First, the algorithm will see if a map entry exists for the modelPath in the ModelCache's pathMap.
         * If not, the walk from the datasource entry to the leaf node will be established, the value set at
         * the leaf, and the map entry in pathMap will be created.
         *
         * @param datasourceId The id of the datasource providing the data.  This is defined uniquely for
         * each datasource, and will likely be the uri of a remote API. The model is designed to handle
         * resultsets from multiple datasources, providing a unique "namespace" per source.  This ensures that
         * id collisions are avoided with resultsets.
         * @param key The key identifying the data.  When a datasource returns a resultset, it may likely be in
         * the format of an object graph.  In this context, the framework supports dot-delimited paths
         * forming an address to the key-value pair to be targeted.  If the data is a simple string, this parameter
         * may be null, or an empty string.
         * @param value The value to assign to the key.
         */
        setNode: function(datasourceId, modelPath, data, component) {
            var paths = modelPath.split('.');
            var path = '';

            // The model path includes the key of the key-value
            // pair that we need to store.  We need leaf - 1
            for (var i = 0; i < paths.length - 1; i++) {
                path += paths[i];
                if (i < paths.length - 1)
                    path += '.';
            }
            var dsEntries = this.data.pathMap[datasourceId];
            if (dsEntries === undefined) {
                dsEntries = new Object();
                this.data.pathMap[datasourceId] = dsEntries;
            }
            // This is the parent node.
            var parent = dsEntries[path];
            var child = null;

            if (parent !== undefined) {
                // Now, check to see if there's a child entry for the leaf
                child = parent[paths[paths.length - 1]];
                if (child === undefined) {
                    // The parent was defined, but we need to add this key value pair
                    parent[paths[paths.length - 1]] = data;
                } else {
                    // Remove all existing map entries for the existing node (and any children)
                    this.removePathMapEntries(modelPath, child);
                    // Set the node
                    parent[paths[paths.length - 1]] = data;
                    // Add new map entries for the new data node
                    this.addPathMapEntries(datasourceId, modelPath, data, component);
                }
            } else {
                // We assume that the dataMap is also unpopulated for this entry.  Go ahead and do that.
                this.addDataMapEntry(datasourceId, modelPath, data);
                // And populate the pathMap
                this.addPathMapEntries(datasourceId, modelPath, data, component);
            }

            if (this.autoSnapshot == true)
                this.stateCache.addState(this);

            Cajeta.theApplication.onModelChanged(this.stateId);

        },

        getNode: function(datasourceId, modelPath) {
            var dsEntries = this.data.pathMap[datasourceId];
            if (dsEntries === undefined)
                throw 'Cajeta.Model.ModelCache.pathMap has no datasource entry for ' + datasourceId;

            return dsEntries[modelPath];
        },

        /**
         * Clear all entries from the map
         */
        clearAllNodes: function() {
            delete this.data;
            this.data = {};
            this.data.dataMap = {};
            this.data.pathMap = {};
            this.data.componentMap = {};
        },

        /**
         * This method is designed to be called by components that have updated their internal DOM values, and their
         * state needs to be mirrored in the corresponding model.  This method will use the internal state of the
         * component's ModelAdaptor for the list of arguments to provide to update(datasourceId, key, value).
         *
         * In addition, this method will use the provided component as an argument to updateBoundComponents to prevent
         * reduntant updates.
         *
         * @param component
         */
        setNodeByComponent: function(component) {
            this.setNode(component.getModelAdaptor().getDatasourceId(), component.getModelAdaptor().getModelPath(),
                component.getValue(), component);
        },

        /**
         * Bind a component to the data model, using information from its Cajeta.View.ModelAdaptor assignment.
         * Changes to the data model (using setters defined here) will result in updates to
         * 1:* dependent components.
         *
         * Binding involves several different mappings to ensure that a simple bijection between a component and
         * a model entry can quickly be derived.  First, we store references in the pathMap for the component,
         * one for the
         * the component and a complete modelPath (my.path.to.data) in a pathMap variable.  This allows
         * the framework to quickly check to see if there's any dependencies for data updates for an arbitrary
         * entry.
         *
         * Next, we create a walk for the entry, ensuring that there's a connected graph entry for each
         * element in the path.
         *
         *
         * @param component
         */
        bindComponent: function(component) {
            var modelPath = component.modelAdaptor.getModelPath();
            var datasourceId = component.modelAdaptor.getDatasourceId();
            var dsEntries = this.data.componentMap[datasourceId];
            if (dsEntries === undefined) {
                dsEntries = new Object();
                this.data.componentMap[datasourceId] = dsEntries;
            }
            var components = dsEntries[modelPath];
            if (components === undefined) {
                components = new Object();
                dsEntries[modelPath] = components;
            }

            components[component.getCanonicalId()] = component;
        },

        /**
         * Release the component.  Components are released, by default, when they are undocked from
         * the DOM to prevent unnecessary updates
         *
         * @param component  The component to unbind from the model
         */
        releaseComponent: function(component) {
            var datasourceId = component.getDatasourceId();
            var modelPath = component.getModelPath();
            if (datasourceId !== undefined && modelPath !== undefined) {
                var dsEntries = this.componentMap[datasourceId];
                if (dsEntries !== undefined) {
                    var components = dsEntries[modelPath];
                    if (components !== undefined)
                        delete components[component.getCanonicalId()];
                }
            }
        },

        getStateId: function() {
            return this.stateCache.getId();
        },

        /**
         * The premise is that we have a modelPath that's been updated with new data.  If the node at modelPath
         * represents the head of a tree, we assume that all of it's children need to be updated.  Otherwise, only
         * the components mapped to the node addressed by modelPath will be updated.
         *
         * @param datasourceId The id of the datasource responsible for this update
         * @param modelPath The path that was changed
         * @param committor Optional, passed in to avoid circular calls when changes are authored by components
         */
        updateBoundComponents: function(datasourceId, modelPath, committor) {
            if (datasourceId === undefined)
                throw 'datasource must be a valid parameter';

            // First, look to see if there's any bindings between the node addressed by the modelPath
            // and components
            var paths = this.data.pathMap[datasourceId];
            if (paths !== undefined) {
                var components = paths[modelPath];
                if (components !== undefined) {
                    for (var name in components) {
                        if (name !== undefined) {
                            var component = components[name];
                            if (component !== committor)
                                component.onModelUpdate();
                        }
                    }
                }
            }


            // Next, look at the node referenced by the address, see if it has children
            var walk = (modelPath.contains('.') ? modelPath.split('.') : modelPath);
            var node = this.data.dataMap[datasourceId];

            // First, iterate to the node addressed by modelPath
            for (var path in walk) {
                if (node === undefined)
                    throw 'Illegal reference to undefined path in ModelCache.dataMap: path does not exist';
                node = node[path];
            }

            // Then recurse through the dataMap under our referenced node, checking for bound components
            if (modelPath !== undefined) {
                paths = this.data.pathMap[datasourceId];

                if (paths !== undefined) {
                    var components = paths[modelPath];
                }
                var components = this.data.pathMap[datasourceId + modelPath];
                if (components != undefined) {
                    for (var canonicalId in components) {
                        var component = components[canonicalId];
                        if (component != undefined && component != committor)
                            component.onModelUpdate();
                    }
                }
            } else {
                for (var name in this.pathMap) {
                    var components = this.data.pathMap[name];
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
    });

    Cajeta.View = {
        homePage: 'homePage'
    };

    /**
     * ModelAdaptor keeps a component and its corresponding model entry synchronized.  Changes to model
     * entries are directed to onModelUpdate.  Conversely, changes to the component are handled by OnComponentUpdate.
     * This class maintains variables that resolve (and bind) a component to a model entry.
     * Component.setModelAdaptor.
     */
    Cajeta.View.ModelAdaptor = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties, true);
            if (this.datasourceId === undefined) {
                this.datasourceId = "local";
            }
            if (this.modelPath === undefined)
                throw "Cajeta.View.ModelAdaptor.modelpath must be defined";
            if (this.elementTarget === undefined)
                this.elementTarget = "value";
        },
        getDatasourceId: function() {
            return this.datasourceId;
        },
        getModelPath: function() {
            return this.modelPath;
        },
        updateComponent: function() {
            var data = Cajeta.theApplication.getModel().getNode(this.datasourceId, this.modelPath);
            this.component.setValue(data);
        },
        updateModel: function() {
            var data = this.component.getValue();
            Cajeta.theApplication.getModel().setNode(this.datasourceId, this.modelPath, data);
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
            $.extend(this, properties);
            if (this.componentId === undefined)
                throw 'A componentId must be defined';
            this.parent = null;
            this.attributes = this.attributes === undefined ? {} : this.attributes;
            this.properties = this.properties === undefined ? {} : this.properties;
            this.cssAttributes = this.cssAttributes === undefined ? {} : this.cssAttributes;
            this.text = this.text === undefined ? {} : this.text;
            this.children = new Object();
            this.hotKeys = new Object();
            this.viewStateId = '';
            this.domEventBound = false;
            if (this.visible === undefined)
                this.visible = true;
            this.valueTarget = "attr:value"; // Could be attr:*, prop:*, or elemVal
            if (this.modelAdaptor !== undefined) {
                this.setModelAdaptor(this.modelAdaptor);
            }
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
         * @param value
         */
        value: function(value) {
            var params = this.valueTarget.split(':');
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
                if (this.isDocked() == true) {
                    return this.dom.text();
                } else if (this.template !== undefined) {
                    return this.template.text();
                } else {
                    return this.text;
                }
            } else {
                if (this.isDocked()) {
                    this.dom.text(value);
                } else if (this.template !== undefined) {
                    this.template.text(value);
                } else {
                    this.text = value;
                }
            }
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
                    if (this.text)
                        this.dom.text(this.text);
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
            if (this.isDocked()) {
                // TODO FIX THIS STATEMENT!!!  Should call into the ModelAdaptor
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
