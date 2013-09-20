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
    'jquery'
], function($) {

    /**
     * Runtime info, including author, verison, and license information.
     */
    var Cajeta = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013',
        homePage: 'homePage',
        ERROR_EVENT_ID_UNDEFINED: 'Error: Cajeta.Events.Event.id is undefined',
        ERROR_DATASOURCE_MODELPATH_UNDEFINED: 'Error: Cajeta.Datasource.Ajax.modelPath must be defined',
        ERROR_AJAX_DATASOURCEID_UNDEFINED: 'Error: Cajeta.Datasource.Ajax.datasourceId must be defined',
        ERROR_RESTAJAX_URITEMPLATE_UNDEFINED: 'Error: A Cajeta.Datasource.RestAjax.uriTemplate must be defined in properties',
        ERROR_STATECACHE_LOADFAILURE: 'Error: Unable to restore state',
        ERROR_MODELCACHE_PATH_UNDEFINED: 'Error: "{0}" could not be resolved to an entry',
        ERROR_MODELADAPTOR_MODELPATH_UNDEFINED: 'Error: modelPath must be defined',
        ERROR_COMPONENT_MODELADAPTOR_UNDEFINED: 'Error: Cajeta.View.Component.modelAdaptor must be defined for "{0}"',
        ERROR_COMPONENT_COMPONENTID_UNDEFINED: 'Error: Cajeta.View.Component.id must be defined',
        ERROR_COMPONENT_INVALIDTEMPLATE: 'Error: Invalid template for "{0}"; must contain an element with a templateId of "{1}"',
        ERROR_COMPONENT_DOCK_UNDEFINED: 'Error: Dock failed, unable to resolve an element with componentId "{0}" in target HTML',
        ERROR_COMPONENT_DOCK_MULTIPLE: 'Error: Dock failed, more than one element was found with componentId "{0}" in target HTML',
        ERROR_MODELADAPTOR_COMPONENT_UNDEFINED: 'Error: Cajeta.View.ModelAdaptor.component must be defined',
        ERROR_APPLICATION_PAGE_UNDEFINED: 'Error: Page "{0}" undefined',
        DEFAULT_PAGETITLE: 'Default Cajeta Page',
        LOCAL_DATASOURCE: 'local',
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
     * If initialize is defined, this will be called.
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

    /**
     * Allows other Cajeta.Class or basic javascript structure to be mixed in with the caller.  This call
     * should be used over $.extend, as the 'super' function, parent class fn refrence, needs to be
     * mixed in, with existing properties preserved (initialize, etc).  $.extend will just overwrite.
     *
     * @param source
     */
    Cajeta.Class.prototype.mixin = function(source) {
        for (var propertyName in source) {
            if (propertyName in this) {
                if (this[propertyName] === source[propertyName])
                    continue;
                if (propertyName == 'super') {
                    var fn = this[propertyName];
                    for (var fnProp in source[propertyName]) {
                        if (!(fnProp in fn)) {
                            fn[fnProp] = source[propertyName][fnProp];
                        }
                    }
                }
            } else {
                this[propertyName] = source[propertyName];
            }
        }
    }

    Cajeta.Events = {
        EVENT_MODELCACHE_CHANGED: 'EVENT_MODELCACHE_CHANGED'
    };

    Cajeta.Events.Event = Cajeta.Class.extend({
        initialize: function(properties) {
            properties = properties || {};
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw Cajeta.ERROR_EVENT_ID_UNDEFINED;
        },
        getId: function() {
            return this.id;
        },
        getEventOperand: function() {
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
            var key = event.getEventOperand();
            var listeners = this.eventListenerMap[key];
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
            if (operand === undefined && listener.getEventOperand !== undefined) {
                operand = listener.getEventOperand();
            }
            var key = operand === undefined ? eventId : eventId + ':' + operand;
            var listeners = Cajeta.safeEntry(key, this.eventListenerMap);
            listeners[listener.getId()] = listener;
        },
        removeListener: function(listener, eventId, operand ) {
            if (listener === undefined || eventId === undefined)
                return;
            if (listener instanceof Cajeta.View.Component)
                listener = listener.modelAdaptor;
            var key = operand === undefined ? eventId : eventId + ':' + operand;
            var listeners = this.eventListenerMap[key];
            if (listeners !== undefined) {
                delete listeners[listener.getId()];
            }
        }
    });

    /**
     * Abstract base object definition for listeners, intended for extension only
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

    return Cajeta;
});
