/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 4:08 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'cajetaDS',
    'vcdiff'
], function($, Cajeta, vcDiff) {

    /**
     * The Model, as in traditional MVC architectures, defines the architecture and interfaces for how data is
     * structured and managed.
     */
    Cajeta.Model = {
        STATECACHE_SETTINGS_URI: '/{applicationId}/stateCache/settings',
        STATECACHE_STATES_URI: '/{applicationId}/stateCache/states',
        STATECACHE_STATE_URI: '/{applicationId}/stateCache/states/{stateId}',
        STATECACHE_DATASOURCE_ID: 'STATECACHE_DATASOURCE'
    };

    Cajeta.Model.StateCacheDS = Cajeta.Datasource.MemoryDS.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        post: function(data, parameters) {
            var uri = this.getUri(parameters);
            var settings = this.cache[this.getUri({
                uriTemplate: Cajeta.Model.STATECACHE_SETTINGS_URI,
                applicationId: parameters.applicationId
            })];
            this.cache[uri + '/' + settings.nextId] = data;
            settings.stateId = settings.nextId++;
            return this.processResult(settings.stateId, parameters);
        },
        get: function(parameters) {
            var uri = this.getUri(parameters);
            var data;
            if (uri.indexOf('settings') >= 0) {
                data = this.cache[uri];
                if (data === undefined) {
                    data = {
                        stateId: 0,
                        nextId: 0,
                        keyPeriod: 10
                    };
                    this.cache[uri] = data;
                }
            } else {
                data = this.cache[uri];
            }
            return this.processResult(data, parameters);
        }
    });

    /**
     * The default datasource for stateCache settings is memory, appearing as always uninitialized to the client
     * at startup.
     */
    Cajeta.Datasource.set(new Cajeta.Model.StateCacheDS({
        id: Cajeta.Model.STATECACHE_DATASOURCE_ID
    }));

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
            $.extend(true, this, properties);
            this.applicationId = this.applicationId || 'defaultAppId';
            this.vcd = new vcDiff.Vcdiff();
            this.vcd.blockSize = 3;

            this.dsStateCache = Cajeta.Datasource.get(Cajeta.Model.STATECACHE_DATASOURCE_ID);
            this.settings = this.dsStateCache.get({
                applicationId: this.applicationId,
                uriTemplate: Cajeta.Model.STATECACHE_SETTINGS_URI
            });
            if (this.settings === undefined) {
                throw 'Error: StateCache datasource incorrectly configured!';
            }
            this.modelJson = '{ }';
        },
        getStateId: function() {
            return this.settings.stateId;
        },

        add: function(model) {
            var json = JSON.stringify(model);
            var data;
            if (this.settings.nextId % this.settings.keyPeriod > 0) {
                data = this.vcd.encode(this.modelJson, json);
            } else {
                data = json;
            }
            this.settings.stateId = this.dsStateCache.post(data, {
                applicationId: this.applicationId,
                uriTemplate: Cajeta.Model.STATECACHE_STATES_URI
            });
            this.modelJson = json;
            return this.settings.stateId;
        },

        /**
         * First, find the closest key frame, load it for our uncompressed starting point, then
         * iterate to the desired ID, restoring each snapshot along the way
         *
         * @param stateId
         */
        load: function(stateId) {
            var startId = stateId - (stateId % this.settings.keyPeriod);
            this.modelJson = this.dsStateCache.get({
                uriTemplate: Cajeta.Model.STATECACHE_STATE_URI,
                applicationId: this.applicationId,
                stateId: startId
            });
            if (this.modelJson === undefined)
                throw Cajeta.ERROR_STATECACHE_LOADFAILURE;
            var delta;
            for (var i = startId + 1; i <= stateId; i++) {
                delta = this.dsStateCache.get({
                    uriTemplate: Cajeta.Model.STATECACHE_STATE_URI,
                    applicationId: this.applicationId,
                    stateId: i
                })
                if (delta === undefined)
                    throw Cajeta.ERROR_STATECACHE_LOADFAILURE;
                this.modelJson = this.vcd.decode(this.modelJson, delta);
            }
            this.settings.stateId = stateId;
            return JSON.parse(this.modelJson);
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
     * state to the model using a mixin of a Cajeta.View.ModelAdaptor instance.  When one component's state is modified,
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
            this.stateId = this.stateCache.getStateId();
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
            datasourceId = datasourceId || Cajeta.LOCAL_DATASOURCE;
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
            this.dispatchEvent(new Cajeta.Events.Event({ id: Cajeta.Events.EVENT_MODELCACHE_CHANGED }));
        },

        /**
         * A utility method to provide simplicity
         * @param component
         */
        setByComponent: function(component) {
            this.set(component.modelPath, component.getComponentValue, component.datasourceId, component);
        },

        /**
         * Returns a node from the object graph
         * @param modelPath
         * @param datasourceId
         * @return {*}
         */
        get: function(modelPath, datasourceId) {
            var path = (datasourceId || Cajeta.LOCAL_DATASOURCE) + ':' + modelPath;
            return this.nodeMap[path];
        },

        /**
         * A utility method to provide simplicity
         * @param component
         * @return {*}
         */
        getByComponent: function(component) {
            return this.get(component.modelPath, component.datasourceId);
        },

        /**
         * Removes a node from the model.
         *
         * @param modelPath The path to the parent node for removal
         * @param datasourceId (optional) The ID of the datasource, defaults to 'local'
         */
        remove: function(modelPath, datasourceId) {
            datasourceId = datasourceId || Cajeta.LOCAL_DATASOURCE;
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

            var event = new Cajeta.Events.Event({ id: Cajeta.Events.EVENT_MODELCACHE_CHANGED });
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
                        id: Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                        op: eventKey
                    });
                    var listeners = this.eventListenerMap[eventKey];
                    for (var listenerId in listeners) {
                        if (listenerId !== undefined) {
                            listeners[listenerId].onEvent(event);
                        }
                    }
                }
            }
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
            if (typeof value == "object") {
                for (var name in value) {
                    if (name !== undefined) {
                        this.nodeMap[modelPath + '.' + name] = value[name];
                        this._addNodeMapEntries(modelPath + '.' + name, value[name], component);
                    }
                }
            }

            // And notify any components bound to this modelPath...
            this.dispatchEvent(new Cajeta.Events.Event({
                id: Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                op: modelPath,
                data: value
            }), component);
        }
    });

    return Cajeta;
});