/**
 * File: cajeta.html4.js
 *
 * This module contains the definitions for HTML4 based components.
 *
 * Copyright (c) 2012 Julian Klappenbach
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
        },
        getValue: function() {
            if (this.isDocked())
                return this.template.text();
            else
                return this.elementText;
        },
        setValue: function(value) {
            if (this.isDocked())
                this.template.text(value);
            else
                this.elementText = value;
        }
    });

    Cajeta.View.Html4.UnorderedList = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'ul';
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this, self.super);

            // Grab the first li child, if any exist, and use that as a template
            // for dynamic population.
            var liChildren = this.template.find('li');
            if (liChildren.length > 0)
                this.listItemHtml = liChildren[0];
            else
                this.listItemHtml = $('<li />');
        }
    });

    Cajeta.View.Html4.Link = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'a';
        },
        getValue: function() {
            if (this.isDocked())
                return this.template.attr('href');
            else
                return this.attrHref;
        },
        setValue: function(value) {
            if (this.isDocked()) {
                this.template.attr('href', value);
            } else {
                this.attrHref = value;
            }
        }
    });

    Cajeta.View.Html4.Span = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'span';
        },
        getValue: function() {
            if (this.isDocked())
                return this.template.html();
            else
                return this.elementText;
        },
        setValue: function(value) {
            if (this.isDocked())
                this.template.html(value);
            else
                this.elementText = value;
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
            if (this.isDocked())
                return this.template.text();
            else
                return this.elementText;
        },
        setValue: function(value) {
            if (this.isDocked())
                this.template.text(value);
            else
                this.elementText = value;
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
     * State handling should be provided by Cajeta.View.ComponentGroup.
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
            if (this.template.attr('value') === undefined) {
                this.template.attr('value', this.componentId);
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
            if (this.isDocked())
                this.template.prop('checked', value);
            else
                this.propChecked = value;
        },
        getValue: function() {
            if (this.isDocked())
                return this.template.prop('checked');
            else
                return this.propChecked;
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
                                option.template(value);
                        }
                    }
                }

                // Add Options and Option Groups
                if (this.options !== undefined) {
                    for (var i = 0; i < this.options.length; i++) {
                        element = $('<' + this.options[i].elementType + ' />');
                        if (this.options[i].elementType == 'optgroup') {
                            element.attr('label', this.options[i].label);
                            element.template(this.options[i].label);
                            for (var j = 0; j < this.options[i].options.length; j++) {
                                var option = $('<' + this.options[i].options[j].elementType + ' />');
                                populateOption(option, this.options[i].options[j]);
                                element.append(option);
                            }
                        } else {
                            populateOption(element, this.options[i]);
                        }
                        this.template.append(element);
                    }
                }

                // Bind the component to the model if we have a valid path
                if (this.modelPath !== undefined) {
                    if (this.defaultValue == undefined) {
                        this.defaultValue = this.template.val();
                    } else {
                        this.template.val(this.defaultValue);
                    }
                    Cajeta.theApplication.getModel().bindComponent(this);
                }
            }
        },
        isMultiple: function() {
            return (!this.isDocked()) ? this.attrMultiple : (this.template.attr('multiple') !== undefined);
        },
        setMultiple: function(multiple) {
            this.propMultiple = multiple;
            if (this.isDocked())
                this.template.prop('multiple', multiple);
        },
        setValue: function(value) {
            if (this.isDocked()) {
                if (this.isMultiple()) {
                    if (value == null) {
                        this.template.find('option').map(function() { this.selected = false; });
                    } else {
                        var options = this.template.find('option');
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
                    this.template.val(value);
                }
            }
        },
        getValue: function() {
            if (this.isDocked()) {
                var value;
                if (this.isMultiple()) {
                    value = this.template.find("option:selected").map(function() { return this.value; }).get().join(",");
                } else {
                    value = this.template.val();
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
            this.elementType = 'img';
        },
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);

            }
        },
        getValue: function() {
            if (this.isDocked()) {
                return this.template.attr('src');
            } else {
                return this.attrSrc;
            }
        },
        setValue: function(value) {
            if (this.isDocked()) {
                this.template.attr('src', value);
            } else {
                this.attrSrc = value;
            }
        }
    });

    Cajeta.View.Html4.Tabs = Cajeta.View.Html4.UnorderedList.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.tabEntries = new Array();
            this.selectedIndex = 0;
        },
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);

                this.template.empty();

                // Create the tabs
                for (var i = 0; i < this.tabEntries.length; i++) {
                    var listItem = this.listItemHtml.clone();
                    listItem.text(this.tabEntries[i].title);
                    var eventData = new Object();
                    eventData['that'] = this;
                    eventData['fnName'] = '$onTabClick';
                    eventData['index'] = i;
                    listItem.click(eventData, Cajeta.View.Component.htmlEventDispatch);
                    this.template.append(listItem);
                }

                this.content = $('div[cajeta\\:componentId="' + this.contentId + '"]');
                if (this.content.length = 0)
                    throw 'No content target with componentId ' + this.contentId + 'was found for Tabs ' +
                            this.componentId + '.';
            }
        },
        addChild: function(tabEntry) {
            if (tabEntry.component === undefined || tabEntry.title === undefined)
                throw 'Invalid tabEntry submitted to tabControl "' + this.componentId + '".';
            tabEntry.component.setComponentId(this.contentId);
            this.tabEntries.push(tabEntry);
        },

        /**
         * Override render here to extend the call to the content div.
         */
        render: function() {
            var self = arguments.length > 0 ? argument[0] : this;
            self.super.render.call(this, self.super);

            this.tabEntries[this.selectedIndex].component.render();
        },

        /**
         * Provide styles for tab selection states.  Supported states are:
         *
         *  unselected      unselected style
         *  selected        selected style
         *
         *  The value for each property entry will be a string containing CSS declarations for the element
         *
         * @param styleMap
         */
        setCss: function(cssClassMap) {
            if (cssClassMap.selected === undefined)
                throw 'Argument must contain map entry for "selected".  See documentation for more on supported states';

            this.cssClassMap = cssClassMap;
        },

        $onTabClick: function(event) {
            var index = event.data['index'];
            if (index !== undefined && index != this.selectedIndex) {
                // TODO:
                // Figure out the best way to show selected state.  Methinks toggling a css class entry is the right way
                // Remove the selection state from the current tab
                // this.template[this.selectedIndex].css()
                // Add it to the component for the one that's been selected.
                // And ideally, we set out selectedIndex...
                // Update the viewStateId (without forcing a pagewide render)
                // And render from this node on down.
            }

        }
    });

    /**
     *
     */
    Cajeta.View.Html4.Form = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'form';
        }
    });

    return Cajeta;
});