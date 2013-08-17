/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 4:14 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'cajetaModel'
], function($, Cajeta) {
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
            this.datasourceId = this.datasourceId || Cajeta.LOCAL_DATASOURCE;
        },
        getId: function() {
            return this.component.getCanonicalId();
        },
        setComponent: function(component) {
            this.component = component;
            this.modelPath = this.modelPath || component.id;
        },
        getDatasourceId: function() {
            return this.datasourceId;
        },
        getModelPath: function() {
            return this.modelPath;
        },
        getModelData: function() {
            return Cajeta.theApplication.getModel().get(this.modelPath, this.datasourceId);
        },
        /**
         * Handles ModelCache change events, applying new data to the component and html.
         * Override this for additional functionality
         *
         * @param event The event containing updated data
         */
        onEvent: function(event) {
            if (this.component === undefined)
                throw Cajeta.ERROR_MODELADAPTOR_COMPONENT_UNDEFINED;
            if (event.getId() == Cajeta.Events.EVENT_MODELCACHE_CHANGED) {
                this.component.setModelValue(event.getData(), true);
            }
        },
        getEventOperand: function() {
            return this.datasourceId + ':' + this.modelPath;
        },
        onComponentChanged: function(data) {
            if (Cajeta.theApplication != null) {
                data = data || this.component.getModelValue();
                Cajeta.theApplication.getModel().set(this.modelPath, data, this.datasourceId, this.component);
            }
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
            properties = properties || {};
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw Cajeta.ERROR_COMPONENT_COMPONENTID_UNDEFINED;
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

            if (this.modelAdaptor === undefined) {
                this.modelAdaptor = new Cajeta.View.ModelAdaptor({
                    modelPath: properties.modelPath || this.id,
                    datasourceId: properties.datasourceId
                });
                this.modelAdaptor.component = this;
            } else {
                this.modelAdaptor.setComponent(this);
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
        getId: function() {
            return this.id;
        },

        /**
         *
         * @param id
         */
        setId: function(id) {
            if (id !== undefined) {
                this.id = id;
            }
        },

        /**
         *
         * @return {*}
         */
        getCanonicalId: function() {
            if (parent !== undefined && parent.getCanonicalId !== undefined)
                return parent.getCanonicalId() + '.' + this.id;
            else
                return this.id;
        },

        setModelAdaptor: function(modelAdaptor) {
            this.modelAdaptor = modelAdaptor;
            this.modelAdaptor.setComponent(this);
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

            if (!internal && this.modelAdaptor !== undefined) {
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
            var id = component.getId();
            if (id == undefined || id == '') {
                throw Cajeta.ERROR_COMPONENT_COMPONENTID_UNDEFINED;
            }
            this.children[id] = component;
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

                            this.template.attr('componentid', this.id);

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
                throw Cajeta.ERROR_COMPONENT_INVALIDTEMPLATE.format(this.getCanonicalId(), templateId);
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
                this.dom = $(type + '[componentid = "' + this.id + '"]');
                if (this.dom.length == 0) {
                    throw Cajeta.ERROR_COMPONENT_DOCK_UNDEFINED.format(this.id);
                } else if (this.dom.length > 1) {
                    throw Cajeta.ERROR_COMPONENT_DOCK_MULTIPLE.format(this.id);
                }
                if (this.template !== undefined) {
                    // Insert our template into the dom...
                    this.dom.html(this.template.html());
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

                // Ensure we have assigned the component ID to the fragment
                this.attr('componentId', this.id);

                // Add the component as a listener to the model, if we have a valid modelAdaptor
                if (this.modelAdaptor !== undefined) {
                    Cajeta.theApplication.model.addListener(this.modelAdaptor, Cajeta.Events.EVENT_MODELCACHE_CHANGED,
                        this.modelAdaptor.getEventOperand());
                }

                // Add to the application component map at this point.
                Cajeta.theApplication.getComponentMap()[this.id] = this;
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

    return Cajeta;
});
