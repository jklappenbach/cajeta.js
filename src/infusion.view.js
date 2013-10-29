/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 4:14 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'infusion.core',
    'model',
    'ds',
    'l10n'
], function($, infusion, model, ds, l10n) {
    infusion.view = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013'
    };

    infusion.view.EventCallback = $.extend(true, Function.prototype, {
        setInstance: function(instance) { this.instance = instance; }
    });

    /**
     * Component, the base for all infusion view classes.  Components feature an API for child management,
     * rendering and state management.
     *
     */
    infusion.view.Component = infusion.Class.extend({
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
                throw new Error(infusion.ERROR_COMPONENT_CID_UNDEFINED);

            if (properties.template !== undefined) {
                this.setTemplate(properties.cid, properties.template);
                delete properties.template;
            }

            if (properties.dsid !== undefined) {
                if (properties.modelAdaptor === undefined) {
                    this.mixin(new infusion.view.ComponentModelAdaptor({
                        dsid: properties.dsid,
                        modelPath: properties.modelPath
                    }));
                    delete properties.dsid;
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
         * Sets the page, recursing over children
         * @param page {infusion.view.Page} The page of the component hierarchy
         */
        setPage: function(page) {
            this.page = page;
            for (var cid in this.children) {
                this.children[cid].setPage(page);
            }
            if (this.factory !== undefined) {
                this.factory.page = page;
            }
        },

        /**
         *
         *
         */
        getComponentValue: function() {
            var value;
            var params = this.modelEncoding.split(':');
            switch (params[0]) {
                case 'attr':
                    value = this.attr(params[1]);
                case 'prop':
                    value = this.prop(params[1]);
                case 'text':
                    value = this.text();
            }

            if (typeof value == "String") {
                if (l10n.hasOwnProperty(value))
                    return l10n[value];
            }
            return value;
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
            if (typeof value == "String") {
                if (l10n.hasOwnProperty(value)) {
                    value = l10n[value];
                }
            }

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
         * Remove the attribute from the dom / template element, as well as the component's internal state
         * @param name The attribute name to remove
         */
        removeAttr: function(name) {
            if (this.isDocked()) {
                this.dom.removeAttr(name);
            }
            if (this.template !== undefined) {
                this.template.removeAttr(name);
            }
            delete this.attributes[name];
        },

        addClass: function(name) {
            if (this.isDocked()) {
                this.dom.addClass(name);
            }
            if (this.template !== undefined) {
                this.template.addClass(name);
            }
        },

        removeClass: function(name) {
            if (this.isDocked()) {
                this.dom.removeClass(name);
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
         * @param child
         */
        addChild: function(child) {
            if (child instanceof infusion.view.Factory) {
                this.factory = child;
                this.factory.parent = this;
            } else {
                var cid = child.cid;
                if (cid == undefined || cid == '') {
                    throw new Error(infusion.ERROR_COMPONENT_CID_UNDEFINED);
                }
                this.children[cid] = child;
            }
            if (this.page !== undefined)
                child.page = this.page;

            child.parent = this;
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

        _synchElementState: function(dom) {
            for (var name in this.attributes) {
                if (name !== undefined)
                    dom.attr(name, this.attributes[name]);
            }
            this.attributes = {};

            for (var name in this.properties) {
                if (name !== undefined)
                    dom.prop(name, this.properties[name]);
            }
            this.properties = {};

            for (var name in this.cssAttributes) {
                if (name !== undefined)
                    dom.css(name, this.cssAttributes[name]);
            }
            this.cssAttributes = {};

            if (this.textValue !== undefined)
                dom.text(this.textValue);
            delete this.textValue;
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
                            this._synchElementState(this.template);
                            break;
                        }
                    }
                }
            }
            if (this.template === undefined) {
                throw new Error(infusion.ERROR_COMPONENT_INVALIDTEMPLATE.format(this.getCanonicalId(), tid));
            }
            this.template.attr('cid', tid);
            this.removeAttr('tid');
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
                    if (this.template.length == 0) {
                        throw new Error(infusion.ERROR_TEMPLATE_DOCK_UNDEFINED.format(this.tid));
                    } else if (this.template.length > 1) {
                        throw new Error(infusion.ERROR_TEMPLATE_DOCK_MULTIPLE.format(this.tid));
                    }
                } else {
                    this.dom = $('*[cid = "' + this.cid + '"]');
                    if (this.dom.length == 0) {
                        throw new Error(infusion.ERROR_COMPONENT_DOCK_UNDEFINED.format(this.cid));
                    } else if (this.dom.length > 1) {
                        throw new Error(infusion.ERROR_COMPONENT_DOCK_MULTIPLE.format(this.cid));
                    }

                    // If we have a template assigned to this component, then inject it, replacing the
                    // existing html
                    if (this.template !== undefined) {
                        // Insert our template into the dom...
                        this.dom.html(this.template.html());
                    }
                }

                // Apply any cached element state properties that were made before we docked
                this._synchElementState(this.dom);

                // Add listeners for our own datamodel, as well as jQuery based hooks
                this.bindHtmlEvents();

                // Add to the application component map at this point.
                model.components[this.getCanonicalId()] = this;

                // Dock any factories we may have
                if (this.factory !== undefined)
                    this.factory.dock();
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

            infusion.message.dispatch.unsubscribe(this, 'model:publish');
        },

        /**
         * Adds a new element based on either the component template, or it's internal state if the template
         * has not been set.  This provides the ability to add templates programmatically, without having to draw upon
         * resources defined in static html.
         */
        inject: function() {
            if (this.parent === undefined)
                throw new Error('infusion.view.Component.parent must be defined in order to inject');

            if (this.template !== undefined) {
                this.template.removeAttr('tid');
                this.parent.dom.append(this.template);
                delete this.template;
            } else {
                var element = '<' + this.elementType + ' cid="' + this.cid + '" />';
                var template = $(element);
                this.parent.dom.append(template);
            }
            delete this.tid;
            this.dock();
        },

        /**
         * Compute the model path by iterating up through parents until either a form (or other collection node is
         * reached, or a node containing a root modelPath (no dot operator) is found.  We'll have to play with it to
         * see what works best.
         */
        populateModelPath: function() {
            var recurseParents = function(parent) {
                var result = undefined;
                if (parent !== undefined) {
                    if (parent.modelPath !== undefined) {
                        if (parent.modelPath.indexOf('.') > 0 && !(parent instanceof infusion.view.Form)) {
                            var base = recurseParents(parent.parent);
                            result = base + '.' + parent.modelPath;
                        } else {
                            result = parent.modelPath;
                        }
                    }
                }
                return result;
            }
            var base = recurseParents(this.parent);
            if (base !== undefined)
                this.modelPath = base + '.' + this.cid;
            else
                this.modelPath = this.cid;
        },

        bindModel: function() {
            if (this.dsid !== undefined) {
                if (this.modelPath === undefined)
                    this.populateModelPath();

                infusion.message.dispatch.subscribe(this, 'model:publish', {
                    id: infusion.message.MESSAGE_MODEL_NODEADDED,
                    dsid: this.dsid,
                    modelPath: this.modelPath
                });

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
                        this.dom.bind(eventName, eventData, infusion.view.Component.htmlEventDispatch);
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
                component.setId(component.cid + idSuffix);
                if (component.dom !== undefined) {
                    component.dom.attr('cid', component.cid);
                } else if (component.template !== undefined) {
                    component.template.attr('cid', component.cid);
                }
                for (var cid in component.children) {
                    if (cid !== undefined) {
                        updateIds(component.children[cid], idSuffix);
                    }
                }
            }

            // First a deep copy to capture our component graph
            var copy = $.extend(true, {}, this);
            if (copy.cid === undefined)
                copy.cid = copy.tid;

            // $.extend won't copy dom elements, but we only need to copy the root
            // level.  All children should dock into the root's fragment.
            if (this.dom !== undefined) {
                copy.dom = this.dom.clone();
            } else if (this.template !== undefined) {
                copy.template = this.template.clone();
            }

            // Recurse to update IDs
            updateIds(copy, idSuffix);

            return copy;
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
    infusion.view.Factory = infusion.message.Subscriber.extend({
        initialize: function(properties) {
            if (properties.dsid === undefined)
                throw new Error("infusion.view.Factory.dsid must be defined");
            $.extend(true, this, properties);
            this.templates = this.templates || {};
            this.rules = this.rules || [];
            this.empty = this.empty || true;
            this.id = this.id || this.uri || this.dsid + ':' + this.modelPath;
        },

        /**
         *
         */
        dock: function() {
            if (!this.parent.isDocked())
                throw new Error('parent component must be docked');

            var templates = this.templates;
            var list = [];
            this.parent.dom.find('*[tid]').each(function() {
                var htmlTemplate = $(this);
                var tid = htmlTemplate.attr('tid');
                if (tid !== undefined && tid != '') {
                    var template = new infusion.view.Component({ tid: tid });
                    template.dock();
                    templates[tid] = template;
                }
                list.push(htmlTemplate);
            });

            // We have to do this outside of the initial iteration as we can't detach until everything is docked and
            // templatized
            for (var id in list) {
                list[id].detach();
            }

            if (this.empty == true) {
                this.parent.dom.empty();
            }

            if (this.modelPath !== undefined) {
                infusion.message.dispatch.subscribe(this, 'model:publish', {
                    dsid: this.dsid,
                    modelPath: this.modelPath
                });
            } else {
                infusion.message.subscribe(this, 'ds:publish', {
                    dsid: this.dsid,
                    status: 'success'
                });
            }
            ds[this.dsid].get({
                modelPath: this.modelPath,
                uri: this.uri
            });
        },

        /**
         * This listener callback receives notification from the model when data is ready.  It assumes the data
         * will be in a specific format, and will create clones of templates, each with a cid made unique through
         * concatenating it's index in the list.  A simple set of rules, passed in through the constructor, or
         * otherwise populated, will be leveraged to alter the components.  For customized datasets, override/mixin
         * this method with a replacement.
         *
         * Format:
         *
         * var simple =         [{ tid: 'optionTemplate', [value: 'value1',] [prop: { key, 'value' }]
         *                          [attr: { key, 'value' },] [css: { key, 'value' }] },
         *                       { tid: 'optionTemplate', ...}, ...];
         * var withChildren =   [{ tid: 'trTemplate',
         *                          children: [{ tid: 'leftLabelTemplate', value: 'value1' },
         *                                     { tid: 'middleLabelTemplate', value: 'value2' },
         *                                     { tid: 'rightLabelTemplate', value: 'value3' }]}, ...];
         *
         *
         * @param msg
         */
        onMessage: function(msg) {
            var dataset = msg.data;

            for (var row in dataset) {
                this.transform(this.parent, dataset[row], this.nextId(dataset[row].tid));
            }
        },

        nextId: function(tid) {
            var index = this.page.factoryIds[tid];
            if (index === undefined)
                index = 0;
            this.page.factoryIds[tid] = index + 1;
            return index;
        },

        /**
         * Transform a dataset result row into a component graph
         *
         * @param parent The parent component, target for injection of new elements
         * @param dataset The dataset
         * @param index The index of the row in the iterated dataset
         * @return {*}
         */
        transform: function(parent, dataset, index) {
            if (dataset.tid === undefined)
                return null;

            if (this.templates[dataset.tid] === undefined)
                throw new Error('tid ' + dataset.tid + ' was not found in the available templates');

            var child = this.templates[dataset.tid].clone(index);
            child.parent = parent;

            if (dataset.value !== undefined)
                child.setComponentValue(dataset.value);

            for (var key in dataset.attr) {
                child.attr(key, dataset.attr[key]);
            }

            for (var key in dataset.prop) {
                child.prop(key, dataset.prop[key]);
            }

            for (var key in dataset.css) {
                child.css(key, dataset.css[key]);
            }

            if (dataset.text !== undefined) {
                child.text(dataset.text);
            }
            for (var rule in this.rules) {
                rule.do(child, index);
            }
            child.inject();

            var subindex = 0;
            for (var childId in dataset.children) {
                this.transform(child, dataset.children[childId], index + '_' + subindex++);
            }

            return child;
        }
    });


    /**
     *
     * @param event
     * @return {*}
     */
    infusion.view.Component.htmlEventDispatch = function(event) {
        return event.data.that[event.data.fnName].call(event.data.that, event);
    };

    /**
     *
     *
     */
    infusion.view.Page = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.title === undefined)
                this.title = infusion.DEFAULT_PAGETITLE;
            this.setElementType('body');
            this.factoryIds = {};
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

        /**
         * Insert the template for this page into the body of the DOM.
         */
        dock: function() {
            this.dom = $('body');

            // html() grabs only the innerHtml, so we start with this (preserving the original body element)
            this.dom.html(this.template.html());

            // Set the styles
            var styles = this.template[0].style;
            for (var style in styles) {
                if (style !== undefined) {
                    var parts = style.split(':');
                    if (parts[0] !== undefined && parts[0] !== '' & parts[1] !== undefined && parts[1] != '')
                        this.dom.css(parts[0], parts[1]);
                }
            }

            // And the class
            this.dom.attr('class', this.template.attr('class'));

            this.setPage(this);
        },

        getViewState: function() {
            var self = arguments[0] || this;
            var viewState = self.super.getViewState.call(this, self.super);
            return (viewState != '' ? this.getCanonicalId() : this.getCanonicalId() + ':' + viewState);
        },

        /**
         * See infusion.Component.render for documentation on this method.
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
    infusion.Application = infusion.Class.extend({
        initialize: function(properties) {
            $.extend(true, this, properties);
            if (this.id === undefined)
                throw new Error('infusion.Application.id must be defined');

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
                    var viewStateId = infusion.homePage;
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
                this.setUrlAnchor(infusion.homePage + "=" + model.getStateId());
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
            this.currentPage.render();
//            try {
//                this.currentPage.render();
//            } catch (e) {
//                alert(JSON.stringify(e));
//            }
        },

        /**
         * Add a page to the application.
         *
         * @param page The page to add
         */
        addPage: function(page) {
            model.components[page.getId()] = page;
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
            var component = model.components[page];

            if (component === undefined)
                throw new Error(infusion.ERROR_APPLICATION_PAGE_UNDEFINED.format(page));

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
                    var component = model.components[componentState[0]];
                    if (component !== undefined) {
                        if (componentState.length > 0) {
                            if (i == 0)
                                page = component;
                            if (componentState.length > 1)
                                component.setViewStateId(componentState[1]);
                        }
                    } else {
                        // We have an invalid viewStateId!  Set it to the homePage
                        viewStateId = infusion.homePage;
                        page = model.components[viewStateId];
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
    infusion.view.Form = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'form';
        }
    });


    /**
     * ModelAdaptor keeps a component and its corresponding model entry synchronized.  Changes to model
     * entries are directed to onModelChanged.  Conversely, changes to the component are handled by OnComponentUpdate.
     * This class maintains variables that resolve (and bind) a component to a model entry.
     * Component.setModelAdaptor.
     */
    infusion.view.ComponentModelAdaptor = infusion.message.Subscriber.extend({
        initialize: function(properties) {
            properties = properties || {};
            if (properties.dsid === undefined)
                throw new Error('infusion.view.ComponentModelAdaptor.dsid must be defined');
            $.extend(true, this, properties);
        },
        /**
         * Override this to provide customized handling of change events from the model
         *
         * @param msg The event containing updated data
         */
        onMessage: function(msg) {
            if (msg.id == infusion.message.MESSAGE_MODEL_NODEADDED) {
                this.setComponentValue(msg.data, true);
            }
        },

        /**
         * Override this method to provide handling for customized component types
         */
        onComponentChanged: function() {
            if (this.modelPath !== undefined) {
                model.setByComponent(this);
            }
        }
    });

    return infusion;
});
