/**
 * infusion.js
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
    'jquery'
], function($) {

    /**
     * Runtime info, including author, verison, and license information.
     */
    var infusion = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013',
        homePage: 'homePage',
        ERROR_EVENT_ID_UNDEFINED: 'infusion.message.Message.id is undefined',
        ERROR_DATASOURCE_MODELPATH_UNDEFINED: 'infusion.ds.Ajax.modelPath must be defined',
        ERROR_AJAX_DATASOURCEID_UNDEFINED: 'infusion.ds.Ajax.dsid must be defined',
        ERROR_RESTAJAX_URITEMPLATE_UNDEFINED: 'A infusion.ds.RestAjax.uriTemplate must be defined in properties',
        ERROR_MODELCACHE_PATH_UNDEFINED: '"{0}" could not be resolved to an entry',
        ERROR_MODELADAPTOR_MODELPATH_UNDEFINED: 'modelPath must be defined',
        ERROR_COMPONENT_MODELADAPTOR_UNDEFINED: 'infusion.view.Component.modelAdaptor must be defined for "{0}"',
        ERROR_COMPONENT_CID_UNDEFINED: 'infusion.view.Component.cid must be defined',
        ERROR_COMPONENT_INVALIDTEMPLATE: 'Invalid template for "{0}"; must contain an element with a tid of "{1}"',
        ERROR_COMPONENT_DOCK_UNDEFINED: 'Dock failed, unable to resolve an element with cid "{0}" in target HTML',
        ERROR_TEMPLATE_DOCK_UNDEFINED: 'Dock failed, unable to resolve an element with tid "{0}" in target HTML',
        ERROR_COMPONENT_DOCK_MULTIPLE: 'Dock failed, more than one element was found with cid "{0}" in target HTML',
        ERROR_MODELADAPTOR_COMPONENT_UNDEFINED: 'infusion.view.ComponentModelAdaptor.component must be defined',
        ERROR_APPLICATION_PAGE_UNDEFINED: 'Page "{0}" undefined',
        DEFAULT_PAGETITLE: 'Default infusion Page',
        safeProperty: function(key, map) {
            var entry = map[key];
            if (entry === undefined) {
                entry = {};
                map[key] = entry;
            }
            return entry;
        },
        safeArray: function(key, map) {
            var entry = map[key];
            if (entry === undefined) {
                entry = [];
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
    infusion.Class = function() { };

    // A global flag to prevent the execution of constructors when in the class
    // definition phase.
    infusion.Class.defining = new Boolean();

    /**
     * Use this method to extend an existing class.  While mixins are supported,
     * inheritance and proper OO design still provide the best mechanisms for
     * code reuse, extension, and long term maintenance.
     *
     * If initialize is defined, this will be called.
     *
     * @param definition The definition with which to extend the base object.
     * @return Object The extended object.
     */
    infusion.Class.extend = function(definition) {
        infusion.Class.defining = true;

        // A proxy constructor for objects, avoids calling constructors (initialize)
        // when object definition logic is executed.
        var child = function() {
            if (!infusion.Class.defining) {
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
        infusion.Class.defining = false;
        return child;
    };

    /**
     * Allows other infusion.Class or basic javascript structure to be mixed in with the caller.  This call
     * should be used over $.extend, as the 'super' function, parent class fn refrence, needs to be
     * mixed in, with existing properties preserved (initialize, etc).  $.extend will just overwrite.
     *
     * @param source
     */
    infusion.Class.prototype.mixin = function(source) {
        for (var propertyName in source) {
            if (propertyName in this) {
                if (propertyName == 'initialize' || propertyName == 'setInstance')
                    continue;
                if (propertyName == 'super') {
                    var fn = this[propertyName];
                    for (var fnProp in source[propertyName]) {
                        if (!(fnProp in fn)) {
                            fn[fnProp] = source[propertyName][fnProp];
                        }
                    }
                } else {
                    this[propertyName] = source[propertyName];
                }
            } else {
                this[propertyName] = source[propertyName];
            }
        }
    }

    /**
     * The namespace for messaging, including the system-wide message, topic-based message dispatch
     * @type {Object}
     */
    infusion.message = { };

    /**
     * An event object not only represents the notification of an event to subscribers in the system, it also
     * the encapsulates the data involved.  Frequently, this will be an update to the application model, or
     * the succesfull resolution to a datasource call.
     *
     * For notification on datasource completion, we have the following data:
     *
     * dsid - The id of the datasource
     * uri - The uri used to reference resources
     * data - The resulting data
     * method - GET, PUT, POST, DEL
     * status - The status of the request, could be error or success
     *
     * Subscribers to DS messages will want to subscribe by dsid:uri:method,
     * and will want to filter on status
     *
     * For updates to the model:
     *
     * dsid - The id of the datasource
     * modelPath - The path used to reference a node in the model
     * data - The resulting data
     *
     * Subscribers to model updates will want to subscribe by dsid:modelPath
     */
    infusion.message.Message = infusion.Class.extend({
        initialize: function(properties) {
            properties = properties || {};
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw new Error(infusion.ERROR_EVENT_ID_UNDEFINED);
        }
    });

    infusion.message.MessageDispatch = infusion.Class.extend({
        initialize: function(properties) {
            if (properties !== undefined)
                $.extend(true, this, properties);
            this.topics = {};
            this.queued = {};
        },
        /**
         * Dispatch an message to a topic
         * @param topic
         * @param msg
         * @param queue (optional) True, if the message is to be queued if undelivered
         */
        publish: function(topic, msg, queue) {
            var subscribers = this.topics[topic];
            var sent = false;
            if (subscribers !== undefined) {
                for (var subscriberId in subscribers) {
                    if (subscriberId !== undefined) {
                        var entry = subscribers[subscriberId];
                        if (entry.subscriber !== msg.source) {
                            this._sendMessage(msg, entry.subscriber, entry.criteria);
                            sent = true;
                        }
                    }
                }
            }
            if (!sent && queue) {
                infusion.safeArray(topic, this.queued).push(msg);
            }
        },

        /**
         * Helper method to determine whether a subscriber receives the event,
         * based on the criteria they establish
         *
         * @param msg
         * @param subscriber
         * @param criteria
         * @private
         */
        _sendMessage: function(msg, subscriber, criteria) {
            var valid = true;
            for (var criteriaId in criteria) {
                if (criteriaId in msg) {
                    // We can have multiple valid values for a particular criteria key
                    if (typeof(criteria[criteriaId]) == 'object') {
                        valid = false;
                        for (var valueId in criteria[criteriaId]) {
                            if (criteria[criteriaId][valueId] == msg[criteriaId]) {
                                valid = true;
                                break;
                            }
                        }
                        if (valid == false)
                            break;
                    } else {
                        if (criteria[criteriaId] != msg[criteriaId]) {
                            valid = false;
                            break;
                        }
                    }
                } else {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                subscriber.onMessage(msg);
            }
        },

        /**
         * Subscribe to receive notifications on events
         *
         * @param subscriber The entity to receive events, must implement onEvent
         * @param topic A string naming the topic for the events
         * @param criteria The criteria for filtering events
         */
        subscribe: function(subscriber, topic, criteria) {
            if (subscriber === undefined || topic === undefined)
                throw new Error('invalid registration parameters for infusion.message.MessageDispatch.subscribe');
            var subscribers = infusion.safeProperty(topic, this.topics);

            var id = subscriber.cid || subscriber.id;
            subscribers[id] = { subscriber: subscriber, criteria: criteria };

            // If, in the rare case, a message has been sent before a subcriber is available, we queue it.
            // When the subscriber is available, we hand them the message, and delete it from queued.
            if (this.queued.hasOwnProperty(topic)) {
                for (var msg in this.queued[topic])
                    this._sendMessage(msg);
                delete this.queued[topic];
            }
        },

        /**
         * Call this method to unsubscribe from a topic
         *
         * @param subscriber The
         * @param topic
         */
        unsubscribe: function(subscriber, topic) {
            if (subscriber === undefined || topic === undefined)
                throw new Error('invalid parameters to unsubscribe, subscriber and topic must be defined');
            var subscribers = this.topics[topic];
            if (subscribers !== undefined) {
                delete subscribers[subscriber.id];
            }
        }
    });

    /**
     * Abstract base object definition for listeners, intended for extension only
     * @type {*}
     */
    infusion.message.Subscriber = infusion.Class.extend({
        initialize: function(properties) {
            if (properties !== undefined) {
                $.extend(true, this, properties);
            }

            if (this.id === undefined)
                throw new Error('infusion.message.Subscriber.id must be defined');
        },

        getId: function() {
            throw new Error('unimplemented');
        },
        onMessage: function(event) {
            throw new Error('unimplemented');
        }
    });

    infusion.message.dispatch = new infusion.message.MessageDispatch();

    return infusion;
});
