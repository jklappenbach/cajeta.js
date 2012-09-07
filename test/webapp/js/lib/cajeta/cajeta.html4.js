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
    Cajeta.View.Html4 = {};

    Cajeta.View.Html4.Div = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'div';
        }
    });

    Cajeta.View.Html4.Link = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'a';
        }
    });

    Cajeta.View.Html4.Span = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'span';
        },
        getValue: function() {
            return this.html.html();
        },
        setValue: function(value) {
            this.html.html(value);
        }
    });

    Cajeta.View.Html4.Label = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'label';
        },
        getValue: function() {
            return this.html.html();
        },
        setValue: function(value) {
            this.html.html(value);
        }
    });

    /**
     *
     */
    Cajeta.View.Html4.Input = Cajeta.View.Component.extend({
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
    Cajeta.View.Html4.TextInput = Cajeta.View.Html4.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.defaultValue !== undefined)
                this.attrValue = this.defaultValue;
        },
        $onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.getValue(), this);
        }
    });

    /**
     * Manages an HTML4 RadioInput control
     * State handling managed by ComponentGroup.
     */
    Cajeta.View.Html4.RadioInput = Cajeta.View.Html4.Input.extend({
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
    Cajeta.View.Html4.CheckboxInput = Cajeta.View.Html4.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        setValue: function(value) {
            this.html.prop('checked', value);
        },
        getValue: function() {
            return this.html.prop('checked');
        },
        $onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.getValue(), this);
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this, self.super);

            // Bind the component to the model if we have a valid path
            if (this.modelPath !== undefined)
                Cajeta.theApplication.getModel().bindComponent(this);
        }
    });

    /**
     *
     */
    Cajeta.View.Html4.TextArea = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'textarea';
        },
        $onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.getValue(), this);
        }
    });

    /**
     *
     * @type {*}
     */
    Cajeta.View.Html4.Legend = Cajeta.View.Component.extend({
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
    Cajeta.View.Html4.Select = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'select';
        },
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);

                var populateOption = function(option, properties) {
                    for (var name in properties) {
                        if (name !== undefined && name != 'elementType') {
                            var value = properties[name];
                            option.attr(name, value);
                            if (name == 'label')
                                option.html(value);
                        }
                    }
                }

                // Add Options and Option Groups
                if (this.options !== undefined) {
                    for (var i = 0; i < this.options.length; i++) {
                        element = $('<' + this.options[i].elementType + ' />');
                        if (this.options[i].elementType == 'optgroup') {
                            element.attr('label', this.options[i].label);
                            element.html(this.options[i].label);
                            for (var j = 0; j < this.options[i].options.length; j++) {
                                var option = $('<' + this.options[i].options[j].elementType + ' />');
                                populateOption(option, this.options[i].options[j]);
                                element.append(option);
                            }
                        } else {
                            populateOption(element, this.options[i]);
                        }
                        this.html.append(element);
                    }
                }

                // Bind the component to the model if we have a valid path
                if (this.modelPath !== undefined) {
                    if (this.defaultValue == undefined) {
                        this.defaultValue = this.html.val();
                    } else {
                        this.html.val(this.defaultValue);
                    }
                    Cajeta.theApplication.getModel().bindComponent(this);
                }
            }
        },
        isMultiple: function() {
            return (!this.isDocked()) ? this.attrMultiple : (this.html.attr('multiple') !== undefined);
        },
        setMultiple: function(multiple) {
            this.propMultiple = multiple;
            if (this.isDocked())
                this.html.prop('multiple', multiple);
        },
        setValue: function(value) {
            if (this.isDocked()) {
                if (this.isMultiple()) {
                    if (value == null) {
                        this.html.find('option').map(function() { this.selected = false; });
                    } else {
                        var options = this.html.find('option');
                        var values = {};
                        value.split(',').map(function() {
                            values[arguments[0]] = true;
                        });
                        for (var i = 0; i < options.length; i++) {
                            options[i].selected = (values[options[i].value] !== undefined);
                        }
                    }
                }
                else {
                    this.html.val(value);
                }
            }
        },
        getValue: function() {
            if (this.isDocked()) {
                var value;
                if (this.isMultiple()) {
                    value = this.html.find("option:selected").map(function() { return this.value; }).get().join(",");
                } else {
                    value = this.html.val();
                }
                return value;
            } else {
                throw 'The component must be docked and active to make this call.';
            }
        },
        $onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.getValue(), this);
        }
    });

    /**
     *
     */
    Cajeta.View.Html4.Image = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.setElementType('img');
        },
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);

            }
        },
        getSrc: function() {

        }

        //src="smiley.gif" alt="Smiley face" width="32" height
    });

    /**
     *
     */
    Cajeta.View.Html4.Form = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.setElementType('form');
        }
    });

    return Cajeta;
});