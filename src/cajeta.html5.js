/**
 * File: cajeta.html5.js
 *
 * This module contains the definitions for HTML5 based components.
 * Copyright (c) 2012 Julian Bach
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

define(['jquery', 'cajeta'], function($, Cajeta) {
    Cajeta.View.Html5 = {};

    Cajeta.View.Html5.Div = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'div';
            this.valueTarget = 'text';
        }
    });

    Cajeta.View.Html5.UnorderedList = Cajeta.View.Component.extend({
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

    Cajeta.View.Html5.Link = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'a';
            this.valueTarget = "attr:href";
        }
    });

    Cajeta.View.Html5.Span = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'span';
            this.valueTarget = "text";
        }
    });

    Cajeta.View.Html5.Label = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'label';
            this.valueTarget = 'text';
        }
    });

    /**
     *
     */
    Cajeta.View.Html5.Input = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            this.elementType = 'input';
            self.super.initialize.call(this, properties);
        }
    });

    /**
     *
     */
    Cajeta.View.Html5.TextInput = Cajeta.View.Html5.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        $onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.getValue(), this);
        }
    });

    /**
     * Manages an HTML4 RadioInput control
     * State handling should be provided by Cajeta.View.ComponentGroup.
     */
    Cajeta.View.Html5.RadioInput = Cajeta.View.Html5.Input.extend({
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
                this.dom.attr('value', this.componentId);
            }
        }
    });

    /**
     * Manages an HTML4 CheckboxInput control
     */
    Cajeta.View.Html5.CheckboxInput = Cajeta.View.Html5.Input.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
        },
        setValue: function(value) {
            if (this.isDocked())
                this.dom.prop('checked', value);
            else
                this.propChecked = value;
        },
        getValue: function() {
            if (this.isDocked())
                return this.dom.prop('checked');
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
    Cajeta.View.Html5.TextArea = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'textarea';
            this.valueTarget = 'text';
        },
        $onHtmlChange: function(event) {
            Cajeta.theApplication.getModel().setByPath(this.modelPath, this.getValue(), this);
        }
    });

    /**
     *
     *
     */
    Cajeta.View.Html5.Legend = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'legend';
        }
    });

    /**
     * Given that forms really no longer play a role in the processing of server submission (there's nothing stopping
     * you from using forms), the practice of choosing a shared 'name' attribute for elements is not the most
     * practical method of assuring exclusive checked-state.  Cajeta.View.Html5.RadioGroup provides a container
     * for the
     *
     */
    Cajeta.View.Html5.RadioGroup = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (this.defaultValue !== undefined)
                this.value = this.defaultValue;
        },
        onModelChanged: function() {
            this.value =  Cajeta.theApplication.getModel().getByPath(this.modelPath);
            // iterate through our set of children, looking for the value attribute of children.
            // The one that matches our current value gets set.
            for (var name in this.children) {
                if (name !== undefined) {
                    if (this.children[name].dom.attr('value') == this.value) {
                        this.children[name].dom.prop('checked', true);
                    }
                }
            }
        },
        onChildChange: function(event) {
            if (this.modelPath !== undefined) {
                var value = event.target.getModelValue();
                if (value === undefined)
                    throw 'Error: A ComponentGroup change event resulted in an undefined model value.';
                this.modelAdaptor.onComponentChanged(this.modelPath, value, this);
            }
        },
        bindHtmlEvents: function() {
            if (this.domEventBound == false) {
                this.domEventBound = true;
                var eventData = new Object();
                eventData['that'] = this;
                eventData['fnName'] = 'onChildChange';
                for (var name in this.children) {
                    if (name !== undefined) {
                        this.children[name].dom.bind('change', eventData, Cajeta.View.Component.htmlEventDispatch);
                    }
                }
            }
        },
        /**
         * There will be no corresponding markup in the template to support groups, so we override dock...
         */
        dock: function() {
            if (!this.isDocked()) {
                // Add to the application component map at this point.
                Cajeta.theApplication.getComponentMap()[this.componentId] = this;

                // Bind the component to the model if we have a valid path
                if (this.modelPath !== undefined)
                    Cajeta.theApplication.getModel().bindComponent(this);
            }
        }
    });


    /**
     *
     *
     */
    Cajeta.View.Html5.Select = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            this.elementType = 'select';
            self.super.initialize.call(this, properties);
        },
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);

                var populateOption = function(option, properties) {
                    for (var name in properties) {
                        if (name !== undefined && name != null && name != 'type') {
                            var value = properties[name];
                            if (name == 'label')
                                option.text(value);
                            else
                                option.attr(name, value);
                        }
                    }
                }

                // Add Options and Option Groups
                if (this.options !== undefined) {
                    for (var i = 0; i < this.options.length; i++) {
                        var element = $('<' + this.options[i].type + ' />');
                        if (this.options[i].type == 'optgroup') {
                            element.attr('label', this.options[i].label);
                            for (var j = 0; j < this.options[i].options.length; j++) {
                                var option = $('<' + this.options[i].options[j].type + ' />');
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
                    if (this.modelValue == undefined) {
                        this.modelValue = this.dom.val();
                    } else {
                        this.dom.val(this.modelValue);
                    }
                    Cajeta.theApplication.getModel().bindComponent(this);
                }
            }
        },
        multiple: function(value) {
            if (value === undefined) {
                return (!this.isDocked()) ? this.attrMultiple : (this.dom.attr('multiple') !== undefined);
            } else {
                this.propMultiple = multiple;
                if (this.isDocked())
                    this.dom.prop('multiple', multiple);
            }
        },
        selectedIndex: function(value) {
            if (value === undefined) {
                if (this.isDocked()) {
                    if (this.multiple()) {
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
                        this.dom.selectedIndex = value;
                    }
                } else {
                    if (this.multiple()) {

                    } else {
                        this.properties['selectedIndex'] = value;
                    }
                }
            } else {
                if (this.isDocked()) {
                    var value;
                    if (this.isMultiple()) {
                        value = this.dom.find("option:selected").map(function() { return this.value; }).get().join(",");
                    } else {
                        value = this.dom.val();
                    }
                    return value;
                } else {
                    return this.attributes['value'];
                }

            }
        },
        getValue: function() {
            return this.selectedIndex();
        },

        $onHtmlChange: function(event) {
            // TODO Need to fix this, so that it works with a model adaptor.  Perhaps we need a special MA!
            Cajeta.theApplication.getModel().setNode(this.modelPath, this.getValue(), this);
        }
    });

    /**
     *
     */
    Cajeta.View.Html5.Image = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'img';
            this.valueTarget = 'attr:src';
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

    Cajeta.View.Html5.TabList = Cajeta.View.Html5.UnorderedList.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            if (properties['content'] !== undefined) {
                this.content = properties['content'];
            } else {
                var contentId = properties['contentId'] === undefined ? 'content' : properties['contentId'];
                this.content = new Cajeta.View.Html5.Div({ componentId: contentId });
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
                    listItem.click(eventData, Cajeta.View.Component.htmlEventDispatch);
                    this.dom.append(listItem);
                    this.tabEntries[i].component.css("display", i == 0 ? "" : "none");
                    this.content.dom.append(this.tabEntries[i].component.template);
                }
            }
        },
        addChild: function(tabEntry) {
            if (tabEntry.component === undefined || tabEntry.title === undefined)
                throw 'Invalid tabEntry submitted to tabControl "' + this.componentId + '".';
            if (tabEntry.component.template === undefined)
                throw 'Only components with valid templates may be used as tab children.';

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
                throw 'Argument must contain map entry for "selected".  See documentation for more on supported states';

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

    /**
     *
     */
    Cajeta.View.Html5.Form = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'form';
        }
    });

    return Cajeta;
});
