/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 4:08 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'cajeta.ds',
    'vcdiff',
    'ds'
], function($, cajeta, vcDiff, ds) {

    /**
     * The Model, as in traditional MVC architectures, defines the architecture and interfaces for how data is
     * structured and managed.
     */
    cajeta.model = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013',
        MESSAGE_MODEL_NODEADDED: 'MESSAGE_MODEL_NODEADDED',
        MESSAGE_MODEL_NODEREMOVED: 'MESSAGE_MODEL_NODEREMOVED',
        ERROR_MODEL_NOSTATECONFIGIURED: 'StateCache datasource incorrectly configured'
    };

    /**
     * If the developer hasn't provided a value, we'll add a default, memory state interface
     */
    if (ds[cajeta.ds.STATE_DATASOURCE_ID] === undefined) {
        ds[cajeta.ds.STATE_DATASOURCE_ID] =  new cajeta.ds.DefaultStateDS({
            id: cajeta.ds.STATE_DATASOURCE_ID
        });
    }

    /**
     * cajeta.ModelSnapshotCache must support the following use cases:
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
    cajeta.model.State = cajeta.Class.extend({
        initialize: function(properties) {
            properties = properties || {};
            $.extend(true, this, properties);
            this.applicationId = this.applicationId || 'defaultAppId';
            this.vcd = new vcDiff.Vcdiff();
            this.vcd.blockSize = 3;
            this.dsidState = this.dsidState || cajeta.ds.STATE_DATASOURCE_ID
            this.dsState = ds[this.dsidState];

            if (this.dsState === undefined)
                throw new Error(cajeta.model.ERROR_MODEL_NOSTATECONFIGIURED);

            this.settings = this.dsState.get({
                applicationId: this.applicationId,
                uriTemplate: cajeta.ds.STATE_SETTINGS_URI,
                async: false
            }).data;

            if (this.settings === undefined) {
                throw new Error(cajeta.model.ERROR_MODEL_NOSTATECONFIGIURED);
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
            this.settings.stateId = this.dsState.post(data, {
                applicationId: this.applicationId
            }).data;
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
            this.modelJson = this.dsState.get({
                uriTemplate: cajeta.ds.STATE_STATE_URI,
                applicationId: this.applicationId,
                stateId: startId
            }).data;
            if (this.modelJson === undefined)
                throw new Error(cajeta.ds.ERROR_STATE_LOADFAILURE);
            var delta;
            for (var i = startId + 1; i <= stateId; i++) {
                delta = this.dsState.get({
                    applicationId: this.applicationId,
                    stateId: i
                }).data;
                if (delta === undefined)
                    throw new Error(cajeta.ds.ERROR_STATE_LOADFAILURE);
                this.modelJson = this.vcd.decode(this.modelJson, delta);
            }
            this.settings.stateId = stateId;
            return JSON.parse(this.modelJson);
        }
    });


    /**
     * <h1>cajeta.Model.ModelCache</h1>
     *
     * cajeta.ModelCache provides a centralized container and services for an application's data model.
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
     * state to the model using a mixin of a cajeta.View.ModelAdaptor instance.  When one component's state is modified,
     * it's changes are persisted to the model, which then uses its internal mappings to identify the other components
     * to notify.
     *
     * <h2>Datasource Support</h2>
     * ModelCache has been designed around the support of multiple datasources by first providing a central
     * access point for shared datasources.  It further provides support by segmenting the cache by dsid,
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
    cajeta.model.Model = cajeta.message.Subscriber.extend({
        /**
         * @param properties
         */
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.id = properties.id || 'theModel';
            self.super.initialize.call(this, properties);

            this.components = this.components || {};
            this.nodes = this.nodes || {};
            this.state = this.state || new cajeta.model.State();

            // First, see if we've been initialized with a desired stateId.  If not,
            // check to see if we have one in a cookie.  Otherwise, set it to zero.
            this.stateId = this.state.getStateId();
            if (this.stateId != 0)
                this.state.load(this.stateId);

            if (this.autoSnapshot === undefined)
                this.autoSnapshot = false;

            // Add our subscriptions
            cajeta.message.dispatch.subscribe(this, cajeta.ds.TOPIC_PUBLISH, { status: 'success' })
        },

        /**
         * Sets a node in the model cache.  If dsid is ommitted, it will default to LOCAL_DATASOURCE.  If
         * component is present, it will prevent the notification of an update to the issuing component.
         *
         * @param modelPath The path to the node in the model cache
         * @param value The value to set
         * @param dsid (optional) The ID of the datasource, defaults to 'local'
         * @param source (optional) The issuing component, prevent cyclical updates.
         */
        set: function(modelPath, value, dsid, source) {
            dsid = dsid || cajeta.ds.LOCAL;
            modelPath = dsid + ':' + modelPath;

            // Find out if we have a single key, or a walk, and populate the map
            // if necessary to support the parent
            var index = modelPath.lastIndexOf('.');
            var key = null, node = null, parentPath = null;
            if (index >= 0) {
                parentPath = modelPath.substring(0, index);
                key = modelPath.substring(index + 1);
                var paths = modelPath.substring(0, index).split('.');
                node = this.nodes;
                for (var pathKey in paths) {
                    node = cajeta.safeProperty(paths[pathKey], node);
                }
            } else  {
                key = modelPath;
                node = this.nodes;
            }

            // Then remove the indexes on child nodes of the element to be replaced
            this._removeNodeMapEntries(modelPath, node);

            node[key] = value;

            // And index the children of the new value
            this._addNodeMapEntries(modelPath, value, source);

            // Take a snapshot if we have auto set
            if (this.autoSnapshot == true)
                this.state.add(this.state);

            // And send out a general notification on model changed.
            cajeta.message.dispatch.publish('model:publish', new cajeta.message.Message({
                id: cajeta.model.MESSAGE_MODEL_NODEADDED,
                source: source
            }));
        },

        /**
         * A utility method to provide simplicity
         * @param component
         */
        setByComponent: function(component) {
            this.set(component.modelPath, component.getComponentValue(), component.dsid, component);
        },

        /**
         * Returns a node from the object graph
         * @param modelPath
         * @param dsid
         * @return {*}
         */
        get: function(modelPath, dsid) {
            var path = (dsid || cajeta.ds.LOCAL) + ':' + modelPath;
            return this.nodes[path];
        },

        /**
         * A utility method to provide simplicity
         * @param component
         * @return {*}
         */
        getByComponent: function(component) {
            return this.get(component.modelPath, component.dsid);
        },

        /**
         * Removes a node from the model.
         *
         * @param modelPath The path to the parent node for removal
         * @param dsid (optional) The ID of the datasource, defaults to 'local'
         * @param source (optional) The source of the call, used to prevent cycles on notification
         */
        remove: function(modelPath, dsid, source) {
            dsid = dsid || cajeta.ds.LOCAL;
            modelPath = dsid + ':' + modelPath;

            if (this.nodes[modelPath] !== undefined) {
                var index = modelPath.lastIndexOf('.');
                var parent, key;
                if (index >= 0) {
                    parent = this.nodes[modelPath.substring(0, index)];
                    key = modelPath.substring(index + 1);
                } else {
                    parent = this.nodes[modelPath];
                    key = modelPath;
                }

                this._removeNodeMapEntries(modelPath, this.nodes[modelPath])
                delete parent[key];
            }

            var msg = new cajeta.message.Message({
                id: cajeta.model.MESSAGE_MODEL_NODEADDED,
                source: source
            });
            cajeta.message.dispatch.publish('model:publish', msg);
        },

        /**
         * Clear all entries from the map
         */
        clearAll: function() {
            this.nodes = {};
        },

        getStateId: function() {
            return this.state.getStateId();
        },

        /**
         * Saves the current model state to the stateCache, and returns the
         * ID applied to the save operation for future restoration.
         *
         * @return The new stateId
         */
        saveState: function() {
            return this.state.add(this.nodes);
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
            if (stateId == this.state.getStateId())
                return;

            this.nodes = this.state.load(stateId);

            // Now, notify all the things...
            for (var eventKey in this.topics) {
                if (eventKey !== undefined) {
                    var event = new cajeta.message.Message({
                        id: cajeta.model.MESSAGE_MODEL_NODEADDED,
                        op: eventKey
                    });
                    var listeners = this.topics[eventKey];
                    for (var listenerId in listeners) {
                        if (listenerId !== undefined) {
                            listeners[listenerId].onMessage(event);
                        }
                    }
                }
            }
        },

        onMessage: function(msg) {
            if (msg.data !== undefined && msg.modelPath !== undefined &&
                msg.dsid !== undefined) {
                if (msg.method == 'delete')
                    this.remove(msg.modelPath, msg.dsid);
                else
                    this.set(msg.modelPath, msg.data, msg.dsid);
            }
        },

        /**
         * Internal method to recursively remove object graphs from the nodeMap
         *
         * @private
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
            delete this.nodes[modelPath];
        },

        /**
         * @private Internal method, indexes object graphs added to the model using the pathMap
         *
         * @param modelPath The model path of the map in the current frame.
         * @param value A node in the object graph to add, algorithm will recurse to all leaves.
         * @param source Used to prevent cycles in notification
         */
        _addNodeMapEntries: function(modelPath, value, source) {
            this.nodes[modelPath] = value;
            if (typeof value == "object" && !(value instanceof Array)) {
                for (var name in value) {
                    if (name !== undefined) {
                        this.nodes[modelPath + '.' + name] = value[name];
                        this._addNodeMapEntries(modelPath + '.' + name, value[name], source);
                    }
                }
            }

            // And notify any components bound to this modelPath...
            var temp = modelPath.split(':');
            cajeta.message.dispatch.publish('model:publish', new cajeta.message.Message({
                id: cajeta.model.MESSAGE_MODEL_NODEADDED,
                dsid: temp[0],
                modelPath: temp[1],
                data: value,
                source: source
            }));
        }
    });

    return cajeta;
});