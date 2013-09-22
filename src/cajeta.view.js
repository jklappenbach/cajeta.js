/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 4:14 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'cajetaCore',
    'model'
], function($, Cajeta, model) {
    Cajeta.View = {
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
         * can be an easier way of extending functionality than inheritance.  A id for the component must be specified.
         * This id will be used to map directly to the associated HTML.
         *
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
            if (properties === undefined || (properties.cid === undefined && properties.tid === undefined))
                throw Cajeta.ERROR_COMPONENT_CID_UNDEFINED;

            if (properties.datasourceId !== undefined) {
                if (properties.modelAdaptor === undefined) {
                    this.mixin(new Cajeta.View.ModelAdaptor({
                        datasourceId: properties.datasourceId,
                        modelPath: properties.modelPath
                    }));
                    delete properties.datasourceId;
                } else {
                    this.mixin(properties.modelAdaptor);
                    delete properties.modelAdaptor;
                }
            }
            $.extend(true, this, properties);

            this.attributes = this.attributes || {};
            this.properties = this.properties || {};
            this.cssAttributes = this.cssAttributes || {};
            this.children = {};
            this.hotKeys = {};
            this.viewStateId = '';
            this.visible = this.visible || true;

            // Default setting for valueTarget, ould be attr:*, prop:*, text (element text)
            this.modelEncoding = this.modelEncoding || "attr:value";
        },

        /**
         *
         * @return {*}
         */
        getId: function() {
            return this.cid;
        },

        /**
         *
         * @param id
         */
        setId: function(id) {
            if (id !== undefined) {
                this.cid = id;
            }
        },

        /**
         *
         * @return {*}
         */
        getCanonicalId: function() {
            if (parent !== undefined && parent.getCanonicalId !== undefined)
                return parent.getCanonicalId() + '.' + this.cid;
            else
                return this.cid;
        },

        /**
         *
         *
         */
        getComponentValue: function() {
            var params = this.modelEncoding.split(':');
            switch (params[0]) {
                case 'attr':
                    return this.attr(params[1]);
                case 'prop':
                    return this.prop(params[1]);
                case 'text':
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
         * @param internal (optional) If true, call is coming from a model update
         */
        setComponentValue: function(value, internal) {
            var params = this.modelEncoding.split(':');
            switch (params[0]) {
                case 'attr':
                    this.attr(params[1], value);
                    break;
                case 'prop':
                    this.prop(params[1], value);
                    break;
                case 'text':
                    this.text(value);
                    break;
            }

            if (internal === undefined || internal == false)
                this.onComponentChanged();
        },

        onComponentChanged: function() {
            // Override or mixin to provide behavior
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
            var id = component.cid;
            if (id == undefined || id == '') {
                throw Cajeta.ERROR_COMPONENT_CID_UNDEFINED;
            }
            this.children[id] = component;
            component.parent = this;
        },

        /**
         *
         * @param cid
         */
        removeChild: function(cid) {
            if (this.children[cid] !== undefined) {
                this.children[cid].undock();
                delete this.children[cid].parent;
                delete this.children[cid];
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
         * @param tid The ID of the template
         * @param template The template source, may contain many templates.
         */
        setTemplate: function(tid, template) {
            var temp = $(template);
            if (temp.length > 0) {
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i].attributes != undefined) {
                        var attrValue = temp[i].attributes['tid'];

                        if (attrValue != undefined && attrValue.value == tid) {
                            this.template = $(temp[i]);
                            this.template.attr('cid', this.cid);

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
                throw Cajeta.ERROR_COMPONENT_INVALIDTEMPLATE.format(this.getCanonicalId(), tid);
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
         * Docks this component into the current html body.  If the component ID is not found, this method
         * will throw an exception.
         */
        dock: function() {
            var type = this.getElementType();
            if (!this.isDocked()) {
                // We've defined the dock element as a template.  Grab the element from the DOM
                // store it as a template, and remove it from the markup
                if (this.tid !== undefined) {
                    this.template = $('*[tid = "' + this.tid + '"]');
//                    this.template = $(type + '[tid = "' + this.tid + '"]');
                    if (this.template.length == 0) {
                        throw Cajeta.ERROR_COMPONENT_DOCK_UNDEFINED.format(this.tid);
                    } else if (this.template.length > 1) {
                        throw Cajeta.ERROR_COMPONENT_DOCK_MULTIPLE.format(this.tid);
                    }
                    $('*[tid = "' + this.tid + '"]').detach();
                    // TODO provide synchronization with settings made before docking
                } else {
                    this.dom = $('*[cid = "' + this.cid + '"]');
//                    this.dom = $(type + '[cid = "' + this.cid + '"]');
                    if (this.dom.length == 0) {
                        throw Cajeta.ERROR_COMPONENT_DOCK_UNDEFINED.format(this.cid);
                    } else if (this.dom.length > 1) {
                        throw Cajeta.ERROR_COMPONENT_DOCK_MULTIPLE.format(this.cid);
                    }

                    // If we have a template assigned to this component, then inject it, replacing the
                    // existing html
                    if (this.template !== undefined) {
                        // Insert our template into the dom...
                        this.dom.html(this.template.html());

                        // Ensure we have assigned the component ID to the fragment
                        this.attr('cid', this.cid);
                    } else {
                        // Otherwise, check for any settings that need to be transfered to the dom
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
                    }

                    // Add listeners for our own datamodel, as well as jQuery based hooks
                    this.bindHtmlEvents();

                    // Add to the application component map at this point.
                    model.componentMap[this.getCanonicalId()] = this;
                }
            }
        },

        /**
         * Remove a component from the window's DOM.  This method will recursively undock all children of the
         * component.  Furthermore, the component will be unbound from the Model, to prevent unnecessary
         * update calls for undisplayed elements.
         */
        undock: function() {
            for (var cid in this.children)
                this.children[cid].undock();

            if (this.isDocked()) {
                this.dom.detach();
            }

            model.removeListener(this);
        },

        /**
         * Compute the model path by iterating up through parents until either a form (or other collection node is
         * reached, or a node containing a root modelPath (no dot operator) is found.  We'll have to play with it to
         * see what works best.
         */
        updateModelPath: function() {
            var recurseParents = function(parent) {
                if (parent !== undefined)
                {
                    if (parent.modelPath !== undefined) {
                        if (parent.modelPath.indexOf('.') > 0 && !(parent instanceof Cajeta.View.Form)) {
                            var base = recurseParents(parent.parent);
                            return base + '.' + parent.modelPath;
                        } else {
                            return parent.modelPath;
                        }
                    } else {
                        return undefined;
                    }
                } else {
                    return undefined;
                }
            }
            var base = recurseParents(this.parent);
            if (base !== undefined)
                this.modelPath = base + '.' + this.cid;
            else
                this.modelPath = this.cid;
        },

        bindModel: function() {
            if (this.datasourceId !== undefined) {
                if (this.modelPath === undefined)
                    this.updateModelPath();

                model.addListener(this, Cajeta.Events.EVENT_MODELCACHE_CHANGED);

                // We may observe the following priorities for setting state:
                // this.modelValue > model.getByComponent > this.getComponentValue
                if (this.modelValue !== undefined) {
                    this.setComponentValue(this.modelValue);
                    delete this.modelValue; // delete it, so that it doesn't persist over future docks
                } else {
                    if (this.promptValue !== undefined) {
                        this.setComponentValue(this.promptValue, true);
                    } else {
                        var value = model.getByComponent(this);
                        if (value !== undefined) {
                            this.setComponentValue(value, true);
                        } else {
                            value = this.getComponentValue();
                            if (value !== undefined) {
                                model.setByComponent(this);
                            }
                        }
                    }
                }
            }
        },

        /**
         * Binds the events generated by the html managed by this component to it's event handlers.
         * The logic follows a naming convention where methods named onHtml* will be bound to their corresponding
         * * events.  These include: change, mouseOver, mouseOut, focus, blur, and click.
         */
        bindHtmlEvents: function() {
            if (this.isDocked()) {
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
                if (!this.isDocked()) {
                    this.dock.call(this);
                    this.bindModel();
                }

                for (var cid in this.children) {
                    if (cid !== undefined)
                        this.children[cid].render();
                }
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
            for (var cid in this.children) {
                var childState = this.children[cid].getViewState();
                if (childState != '')
                    stateId += ':' + childState;
            }
            return stateId;
        },

        /**
         * Returns a clone of the component, complete with a deep copy of each of the component's children.  Any dom
         * fragments, whether templates or live elements, will be copied without event or data.  As component IDs are
         * unique to a DOM, the idSuffix will be used to append an additional fragment for the id of this component,
         * and all children.  This will also be relfected in any DOM fragments.  It is up to the developer (or calling
         * code) to append the cloned element into the DOM.
         */
        clone: function(idSuffix) {
            var updateIds = function(component, idSuffix) {
                component.setId(component.id + idSuffix);
                if (component.dom !== undefined) {
                    component.dom.attr('cid', component.id);
                } else if (component.template !== undefined) {
                    component.template.attr('cid', component.id);
                }
                for (var cid in component.children) {
                    if (cid !== undefined) {
                        updateIds(component.children[cid], idSuffix);
                    }
                }
            }

            // First a deep copy to capture our component graph
            var copy = $.extend(true, {}, this);

            // $.extend won't copy dom elements, but we only need to copy the root
            // level.  All children should dock into the root's fragment.
            if (this.dom !== undefined) {
                copy.dom = this.dom.clone();
            } else if (this.template !== undefined) {
                copy.template = this.template;
            }

            // Recurse to update IDs
            updateIds(copy, idSuffix);
        }
    });

    /**
     * The concept is that a repeater will bind to an element that will provide the container for display.  This could
     * be a div, a table, or even a list.  The repeater markup must feature an element with "contentId" as an attribute.
     * This will be the element that is repeated in the container.  The original element will be reserved as a template,
     * while clones will be inserted into the container.  The repeater will then use its model path to identify a .
     * Each object will need to offer properties with names that correspond to the component IDs of children.
     * The value of these objects will be used to set the modelValue of the children.  Finally, the repeater will
     * create an additional copy of its docked component (complete with all of its children), update the IDs
     * (appending with a 0-based index), and add these copies to the Repeater's component.
     */
    Cajeta.View.Repeater = Cajeta.View.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            this.overwrite = this.overwrite || true;
            self.super.initialize.call(this, properties);
            if (this.content === undefined)
                throw "Error: Cajeta.View.Repeater.content must be defined";
        },

        /**
         * First, dock using the normal base implementation.  Once the components are successfully docked,
         * the repeater will use the model to determine how many additional sets will be added.
         */
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);
//                this.content.dock();

                if (this.overwrite) {

                } else {

                }
                var data = model.getByComponent(this);
                var i = 0;
                for (var row in data) {
                    var child = this.content.clone('[' + i + ']');
                    this.dom.append(child.dom);
                    this.addChild(child);
                    child.dock();
                }
            }
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
                this.title = Cajeta.DEFAULT_PAGETITLE;
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
            var self = arguments[0] || this;
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
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw 'Error: Cajeta.Application.id must be defined';

            this.viewStateAliasMap = this.viewStateAliasMap || {};
            this.anchor = this.anchor || '';
            this.viewStateId = this.viewStateId || '';
            this.modelStateId = this.modelStateId || '';

            this.stringResourceMap = this.stringResourceMap || {};
            this.currentPage = this.currentPage || null;
            this.executing = this.executing || false;
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
                var app = this;
                if ("onhashchange" in window) { //&& !($.browser.msie)) {
                    window.onhashchange = function() {
                        app.onAnchorChanged();
                    }
                } else {
                    // Quick and dirty to detect anchor hash change for primitive browsers
                    var prevHash = window.location.hash;
                    window.setInterval(function () {
                        if (window.location.hash != prevHash) {
                            app.onAnchorChanged();
                        }
                    }, 200);
                }
                this.executing = true;
                this.anchor = this.getUrlAnchor();

                // If we have a page request without an anchor, set it to the defaults
                // for the application, and populate the (browser's) url with the anchor,
                // bootstrapping the render.
                if (this.anchor === undefined || this.anchor == '') {
                    var viewStateId = Cajeta.homePage;
                    this.anchor = viewStateId;

                    if (model !== undefined && model.enableHistory == true) {
                        this.modelStateId = model.getStateId();
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
//                if (model.isHistoryEnabled()) {
//                    if (states.length > 1) {
//                        this.setModelStateId(states[1]);
//                        validModelId = model.getStateId();
//                    } else if (model.isHistoryEnabled() == true) {
//                        validModelId = modelStateId = model.getStateId();
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
                this.setUrlAnchor(Cajeta.homePage + "=" + model.getStateId());
            }
        },

        /**
         * Called with the model is updated
         */
        onModelChanged: function() {
            this.anchor = '#' + this.viewStateId + '=' + model.getStateId();
            this.setUrlAnchor(this.anchor);
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
            } catch (e) {
                alert(JSON.stringify(e));
            }
        },

        /**
         * Add a page to the application.
         *
         * @param page The page to add
         */
        addPage: function(page) {
            model.componentMap[page.getId()] = page;
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
            var component = model.componentMap[page];

            if (component === undefined)
                throw Cajeta.str.ERROR_APPLICATION_PAGE_UNDEFINED.format(page);

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
                    var component = model.componentMap[componentState[0]];
                    if (component !== undefined) {
                        if (componentState.length > 0) {
                            if (i == 0)
                                page = component;
                            if (componentState.length > 1)
                                component.setViewStateId(componentState[1]);
                        }
                    } else {
                        // We have an invalid viewStateId!  Set it to the homePage
                        viewStateId = Cajeta.homePage;
                        page = model.componentMap[viewStateId];
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
            model.loadState(this.modelStateId);
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
     * A form element, acting as a container for form elements.  Setting autoPath to true will cause the
     * form's addChild logic to modify the modelPath of children, creating a single hierachy.  For example,
     * if the form had the modelPath of "form", and a child was added the following logic will be executed:
     *
     *  1.  If there's no modelPath on the form element, the element's id will be used, and will be
     *      set to 'form.[id]'
     *  2.  If a modelPath has been given, and doesn't contain dots ('.'), the modelPath will be set to 'form.[modelPath]'.
     *  3.  If the modelPath contains dots, it will be used without modification.
     */
    Cajeta.View.Form = Cajeta.View.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'form';
        },

        /**
         *
         */
        onSubmit: function() {

        }
    });


    /**
     * ModelAdaptor keeps a component and its corresponding model entry synchronized.  Changes to model
     * entries are directed to onModelChanged.  Conversely, changes to the component are handled by OnComponentUpdate.
     * This class maintains variables that resolve (and bind) a component to a model entry.
     * Component.setModelAdaptor.
     */
    Cajeta.View.ModelAdaptor = Cajeta.Events.Listener.extend({
        initialize: function(properties) {
            properties = properties || {};
            $.extend(true, this, properties);
            if (this.datasourceId === undefined)
                throw 'Error: Cajeta.View.ModelAdaptor.datasourceId must be defined';
        },
        /**
         * Handles ModelCache change events, applying new data to the component and html.
         * Override this for additional functionality
         *
         * @param event The event containing updated data
         */
        onEvent: function(event) {
            if (event.getId() == Cajeta.Events.EVENT_MODELCACHE_CHANGED) {
                this.setComponentValue(event.getData(), true);
            }
        },
        getEventOperand: function() {
            return this.datasourceId + ':' + this.modelPath;
        },
        onComponentChanged: function() {
            if (this.modelPath !== undefined) {
                model.setByComponent(this);
            }
        }
    });

    return Cajeta;
});
