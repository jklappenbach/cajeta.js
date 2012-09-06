/**
 * File: cajeta.html4.js
 *
 * This module contains the definitions for HTML4 based components.
 *
 * Copyright (c) 2012 Julian Bach
 *
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
 * NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

define(['jquery', 'cajeta'], function($, Cajeta) {

    Cajeta.View.Div = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'div';
        }
    });

    Cajeta.View.Link = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'a';
        }
    });

    Cajeta.View.Span = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'span';
        },
        onModelUpdate: function() {
            if (this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        }
    });

    Cajeta.View.Label = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'label';
        },
        onModelUpdate: function() {
            if (this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        }
    });

    /**
     *
     */
    Cajeta.View.Input = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'input';
            if (this.attrValue === undefined) {
                if (properties.defaultValue !== undefined)
                    this.attrValue = properties.defaultValue;
                else
                    this.attrValue = this.componentId;
            }
        },
        setAttrName: function(name) {
            this.attrName = name;
            if (this.isDocked())
                this.html.attr('name', name);
        },
        getAttrName: function() {
            if (!this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            return this.html.attr('name');
        },
        setAttrType: function(type) {
            this.attrType = type;
            if (this.isDocked())
                this.html.attr('type', type);
        },
        getAttrType: function() {
            if (!this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            return this.html.attr('type');
        },
        setAttrValue: function(value) {
            this.html.attr('value', value);
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        },
        getAttrValue: function() {
            if (!this.isDocked())
                throw 'html was undefined for componentId ' + this.componentId;

            return this.html.attr('value');
        }
    });

    /**
     *
     */
    Cajeta.View.TextInput = Cajeta.View.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.defaultValue !== undefined)
                this.attrValue = this.defaultValue;
        },
        onModelUpdate: function() {
            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        },
        onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        }
    });

    /**
     * Manages an HTML4 RadioInput control
     * State handling managed by ComponentGroup.
     */
    Cajeta.View.RadioInput = Cajeta.View.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this);

            // Set the value of the element if not set in markup
            if (this.html.attr('value') === undefined) {
                this.html.attr('value', this.componentId);
            }
        }
    });

    /**
     * Manages an HTML4 CheckboxInput control
     */
    Cajeta.View.CheckboxInput = Cajeta.View.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        isChecked: function() {
            if (this.isDocked())
                return this.html.prop('checked');
            else
                throw 'Component must be docked before calling this method.';
        },
        onModelUpdate: function() {
            var data = Cajeta.theApplication.getModel().getByPath(this.modelPath);
            this.html.prop('checked', data);
        },
        onHtmlChange: function(event) {
            var data = this.html.prop('checked');
            Cajeta.theApplication.getModel().setByPath(this.modelPath, data, this);
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this, self.super);

            // Bind the component to the model if we have a valid path
            if (this.modelPath !== undefined)
                Cajeta.theApplication.getModel().bindComponent(this);

            // Set the value of the element if not set in markup
            if (this.html.attr('value') === undefined) {
                this.html.attr('value', this.componentId);
            }
        }
    });

    /**
     *
     */
    Cajeta.View.TextArea = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'textarea';
        },
        setAttrName: function(name) {
            this.attrName = name;
            if (this.isDocked())
                this.html.attr('name', name);
        },
        getAttrName: function() {
            if (!this.isDocked())
                return this.attrName;

            return this.html.attr('name');
        },
        setAttrCols: function(cols) {
            this.attrCols = cols;
            if (this.isDocked())
                this.html.attr('cols', cols);
        },
        getAttrCols: function() {
            if (!this.isDocked())
                return this.attrCols;

            return this.html.attr('cols');
        },
        setAttrRows: function(rows) {
            this.attrRows = rows;
            if (this.isDocked())
                this.html.attr('rows', rows);
        },
        getAttrRows: function() {
            if (!this.isDocked())
                return this.attrRows;

            return this.html.attr('rows');
        },
        setAttrReadonly: function(readonly) {
            this.attrReadonly = readonly;
            if (this.isDocked())
                this.html.attr('readonly', readonly);
        },
        getAttrReadonly: function() {
            if (!this.isDocked())
                return this.attrReadonly;

            return this.html.attr('readonly');
        },
        onModelUpdate: function() {
            this.html.attr('value', Cajeta.theApplication.getModel().getByPath(this.modelPath));
        },
        onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        }
    });

    /**
     *
     * @type {*}
     */
    Cajeta.View.Legend = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'legend';
        }
    });

    /**
     *
     * @type {*}
     */
    Cajeta.View.Select = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'select';
        },
        dock: function() {
            // TODO Must fix the oddness with the static select options moved to the programmatic option select.
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this, self.super);

            if (this.options !== undefined) {
                for (var i = 0; i < this.options.length; i++) {
                    var element = $(this.options[i].elementType);
                    delete this.options[i].elementType;
                    $.extend(element, this.options[i]);
                    this.html.append(element);
                }
            }

            // Bind the component to the model if we have a valid path
            if (this.modelPath !== undefined)
                Cajeta.theApplication.getModel().bindComponent(this);

            // Set the value of the element if not set in markup
            if (this.html.attr('value') === undefined) {
                this.html.attr('value', this.componentId);
            }
        }
    });

    /**
     *
     */
    Cajeta.View.Form = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.setElementType('form');
        }
    });

    return Cajeta;
});