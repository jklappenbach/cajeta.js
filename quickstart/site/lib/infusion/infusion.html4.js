/**
 * File: infusion.html4.js
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

define(['jquery', 'infusion.view', 'model'], function($, infusion, model) {
    infusion.view.Html4 = {};

    infusion.view.Html4.Div = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'div';
        },
        getValue: function() {
            if (this.isDocked())
                return this.dom.text();
            else
                return this.elementText;
        },
        setValue: function(value) {
            if (this.isDocked())
                this.dom.text(value);
            else
                this.elementText = value;
        }
    });

    infusion.view.Html4.UnorderedList = infusion.view.Component.extend({
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
            var liChildren = this.dom.find('li');
            if (liChildren.length > 0)
                this.listItemHtml = liChildren[0];
            else
                this.listItemHtml = $('<li />');
        }
    });

    infusion.view.Html4.Link = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'a';
        },
        getValue: function() {
            if (this.isDocked())
                return this.dom.attr('href');
            else
                return this.attrHref;
        },
        setValue: function(value) {
            if (this.isDocked()) {
                this.dom.attr('href', value);
            } else {
                this.attrHref = value;
            }
        }
    });

    infusion.view.Html4.Span = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'span';
        },
        getValue: function() {
            if (this.isDocked())
                return this.dom.html();
            else
                return this.elementText;
        },
        setValue: function(value) {
            if (this.isDocked())
                this.dom.html(value);
            else
                this.elementText = value;
        }
    });

    infusion.view.Html4.Img = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'span';
        },
        height: function(value) {
            if (value !== undefined) {
                this.attr('height', value);
            } else {
                return this.attr('height');
            }
        },
        width: function(value) {
            if (value !== undefined) {
                this.attr('width', value);
            } else {
                return this.attr('width');
            }
        },
        ismap: function(value) {
            if (value !== undefined) {
                this.attr('ismap', value);
            } else {
                return this.attr('ismap');
            }
        },
        src: function(value) {
            if (value !== undefined) {
                this.attr('src', value);
            } else {
                return this.attr('src');
            }
        },
        usemap: function(value) {
            if (value !== undefined) {
                this.attr('usemap', value);
            } else {
                return this.attr('usemap');
            }
        }

    });

    infusion.view.Html4.Label = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'label';
        },
        getValue: function() {
            if (this.isDocked())
                return this.dom.text();
            else
                return this.elementText;
        },
        setValue: function(value) {
            if (this.isDocked())
                this.dom.text(value);
            else
                this.elementText = value;
        }
    });

    /**
     *
     */
    infusion.view.Html4.Input = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'input';
            if (this.attrValue === undefined) {
                if (properties.defaultValue !== undefined)
                    this.attrValue = properties.defaultValue;
                else
                    this.attrValue = this.cid;
            }
        }
    });

    /**
     *
     */
    infusion.view.Html4.TextInput = infusion.view.Html4.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.defaultValue !== undefined)
                this.attrValue = this.defaultValue;
        },
        $onHtmlChange: function(event) {
            this.onComponentChanged();
        }
    });

    /**
     * Manages an HTML4 RadioInput control
     * State handling should be provided by infusion.View.ComponentGroup.
     */
    infusion.view.Html4.RadioInput = infusion.view.Html4.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this);

            // Set the value of the element if not set in markup
            if (this.dom.attr('value') === undefined) {
                this.dom.attr('value', this.cid);
            }
        }
    });

    /**
     * Manages an HTML4 CheckboxInput control
     */
    infusion.view.Html4.CheckboxInput = infusion.view.Html4.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        $onHtmlChange: function(event) {
            this.onComponentChanged();
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this, self.super);
        }
    });

    /**
     *
     */
    infusion.view.Html4.TextArea = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'textarea';
        },
        $onHtmlChange: function(event) {
            // TODO: FIX ME! model.setByPath(this.modelPath, this.getValue(), this);
        }
    });

    /**
     *
     * @type {*}
     */
    infusion.view.Html4.Legend = infusion.view.Component.extend({
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
    infusion.view.Html4.Select = infusion.view.Component.extend({
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
                                option.setTemplate(value);
                        }
                    }
                }

                // Add Options and Option Groups
                if (this.options !== undefined) {
                    for (var i = 0; i < this.options.length; i++) {
                        element = $('<' + this.options[i].elementType + ' />');
                        if (this.options[i].elementType == 'optgroup') {
                            element.attr('label', this.options[i].label);
                            element.setTemplate(this.options[i].label);
                            for (var j = 0; j < this.options[i].options.length; j++) {
                                var option = $('<' + this.options[i].options[j].elementType + ' />');
                                populateOption(option, this.options[i].options[j]);
                                element.append(option);
                            }
                        } else {
                            populateOption(element, this.options[i]);
                        }
                        this.dom.append(element);
                    }
                }

                // Bind the component to the model if we have a valid path
                if (this.modelPath !== undefined) {
                    if (this.defaultValue == undefined) {
                        this.defaultValue = this.dom.val();
                    } else {
                        this.dom.val(this.defaultValue);
                    }
                    model.bindComponent(this);
                }
            }
        },
        isMultiple: function() {
            return (!this.isDocked()) ? this.attrMultiple : (this.dom.attr('multiple') !== undefined);
        },
        setMultiple: function(multiple) {
            this.propMultiple = multiple;
            if (this.isDocked())
                this.dom.prop('multiple', multiple);
        },
        setValue: function(value) {
            if (this.isDocked()) {
                if (this.isMultiple()) {
                    if (value == null) {
                        this.dom.find('option').map(function() { this.selected = false; });
                    } else {
                        var options = this.dom.find('option');
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
                    this.dom.val(value);
                }
            }
        },
        getValue: function() {
            if (this.isDocked()) {
                var value;
                if (this.isMultiple()) {
                    value = this.dom.find("option:selected").map(function() { return this.value; }).get().join(",");
                } else {
                    value = this.dom.val();
                }
                return value;
            } else {
                throw new Error('The component must be docked and active to make this call.');
            }
        },
        $onHtmlChange: function(event) {
            model.setByPath(this.modelPath, this.getValue(), this);
        }
    });

    /**
     *
     */
    infusion.view.Html4.Image = infusion.view.Component.extend({
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
                return this.dom.attr('src');
            } else {
                return this.attrSrc;
            }
        },
        setValue: function(value) {
            if (this.isDocked()) {
                this.dom.attr('src', value);
            } else {
                this.attrSrc = value;
            }
        }
    });

    infusion.view.Html4.TabList = infusion.view.Html4.UnorderedList.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (properties['content'] !== undefined) {
                this.content = properties['content'];
            } else {
                var contentId = properties['contentId'] === undefined ? 'content' : properties['contentId'];
                this.content = new infusion.view.Html4.Div({ cid: contentId });
            }
            this.tabEntries = new Array();
            this.selectedIndex = 0;
        },
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);
                this.content.dock();

                // Create the tabs and populate the view
                this.dom.empty();
                this.content.dom.empty();

                for (var i = 0; i < this.tabEntries.length; i++) {
                    var listItem = this.listItemHtml.clone();
                    listItem.text(this.tabEntries[i].title);
                    var eventData = new Object();
                    eventData['that'] = this;
                    eventData['fnName'] = '$onTabClick';
                    eventData['index'] = i;
                    listItem.click(eventData, infusion.view.Component.htmlEventDispatch);
                    this.dom.append(listItem);
                    this.tabEntries[i].component.css("display", i == 0 ? "" : "none");
                    this.content.dom.append(this.tabEntries[i].component.template);
                }
            }
        },
        addChild: function(tabEntry) {
            if (tabEntry.component === undefined || tabEntry.title === undefined)
                throw new Error('Invalid tabEntry submitted to tabControl "' + this.cid + '".');
            if (tabEntry.component.template === undefined)
                throw new Error('Only components with valid templates may be used as tab children.');

            // We set the contentId to dock using existing logic
            this.tabEntries.push(tabEntry);
        },

        /**
         * Override render here to extend the call to the content div.
         */
        render: function() {
            var self = arguments.length > 0 ? arguments[0] : this;
            self.super.render.call(this, self.super);
            this.tabEntries[this.selectedIndex].component.render(this, self.super);
        },

        /**
         *
         * @param cssClassMap
         */
        setCss: function(cssClassMap) {
            if (cssClassMap.selected === undefined)
                throw new Error('Argument must contain map entry for "selected".  See documentation for more on supported states');

            this.cssClassMap = cssClassMap;
        },

        $onTabClick: function(event) {
            var index = event.data['index'];
            //console.log("Selected index was " + index);
            if (index !== undefined && index != this.selectedIndex) {
                this.tabEntries[this.selectedIndex].component.css("display", "none");
                this.selectedIndex = index;
                this.tabEntries[this.selectedIndex].component.css("display", "");
            }

        }
    });

    return infusion;
});