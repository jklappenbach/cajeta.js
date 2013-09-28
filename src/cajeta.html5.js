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

define(['jquery', 'cajeta.view', 'model'], function($, cajeta, model) {
    cajeta.view.html5 = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013',
        ERROR_TABLIST_INVALID_TABENTRY: 'A TabEntry was submitted to tabControl "{0}" with missing attributes.',
        ERROR_TABLIST_TABENTRYTEMPLATE_UNDEFINED: 'TabEntry "{0}" submitted to tabControl "{1}" with no template.'
    };

    cajeta.view.html5.Div = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'div';
            properties.modelEncoding = 'text';
            self.super.initialize.call(this, properties);
        }
    });

    cajeta.view.html5.Button = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'button';
            properties.modelEncoding = 'text';
            self.super.initialize.call(this, properties);
        },
        populateModelPath: function() { }
    });

    cajeta.view.html5.UnorderedList = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            properties.elementType = 'ul';
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

    cajeta.view.html5.Table = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'table';
            self.super.initialize.call(this, properties);
        }
    });

    cajeta.view.html5.TableRow = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'tr';
            self.super.initialize.call(this, properties);
        }
    });

    cajeta.view.html5.TableDivision = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'td';
            self.super.initialize.call(this, properties);
        }
    });

    cajeta.view.html5.Link = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'a';
            properties.modelEncoding = "attr:href";
            self.super.initialize.call(this, properties);
        }
    });

    cajeta.view.html5.Span = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'span';
            properties.modelEncoding = "text";
            self.super.initialize.call(this, properties);
        }
    });

    cajeta.view.html5.Label = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'label';
            properties.modelEncoding = 'text';
            self.super.initialize.call(this, properties);
        }
    });

    /**
     *
     */
    cajeta.view.html5.Input = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'input';
            self.super.initialize.call(this, properties);
        },
        _onHtmlChange: function(event) {
            this.onComponentChanged();
        }
    });

    /**
     *
     */
    cajeta.view.html5.TextInput = cajeta.view.html5.Input.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.dsid = properties.dsid || cajeta.ds.LOCAL;
            self.super.initialize.call(this, properties);
        },
        getComponentValue: function() {
            var value;
            if (this.isDocked()) {
                value = this.dom.val();
            } else {
                var self = (arguments.length > 0) ? arguments[0] : this;
                value = self.super.getComponentValue.call(this);
            }

            if (value == this.promptValue)
                value = '';

            return value;
        }
    });

    /**
     * Manages an HTML4 RadioInput control
     * State handling should be provided by cajeta.View.ComponentGroup.
     */
    cajeta.view.html5.RadioInput = cajeta.view.html5.Input.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.modelEncoding = 'prop:checked';
            self.super.initialize.call(this, properties);
        },
        dock: function() {
            var self = (arguments.length > 0) ? arguments[0] : this;
            self.super.dock.call(this);

            // Set the value of the element if not set in markup
            if (this.dom.attr('value') === undefined) {
                this.dom.attr('value', this.cid);
            }
        },
        _onHtmlChange: function(event) {
            this.parent.onComponentChanged();
        },
        populateModelPath: function() { }
    });

    /**
     * Manages an HTML5 CheckboxInput control
     */
    cajeta.view.html5.CheckboxInput = cajeta.view.html5.Input.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.modelEncoding = 'prop:checked';
            properties.dsid = properties.dsid || cajeta.ds.LOCAL;
            self.super.initialize.call(this, properties);
        }
    });

    /**
     *
     */
    cajeta.view.html5.TextArea = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'textarea';
            properties.modelEncoding = 'text';
            properties.dsid = properties.dsid || cajeta.ds.LOCAL;
            self.super.initialize.call(this, properties);
        },
        _onHtmlChange: function(event) {
            this.onComponentChanged();
        },
        getComponentValue: function() {
            var value;
            if (this.isDocked()) {
                value = this.dom.val();
            } else {
                var self = (arguments.length > 0) ? arguments[0] : this;
                 value = self.super.getComponentValue.call(this);
            }

            if (value == this.promptValue)
                value = '';

            return value;
        }
    });

    /**
     *
     *
     */
    cajeta.view.html5.Legend = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'legend';
            properties.modelEncoding = 'text';
            self.super.initialize.call(this, properties);
        }
    });

    /**
     * Given that forms really no longer play a role in the processing of server submission (there's nothing stopping
     * you from using forms), the practice of choosing a shared 'name' attribute for elements is not the most
     * practical method of assuring exclusive checked-state.  cajeta.View.Html5.RadioGroup provides a container
     * for the
     *
     */
    cajeta.view.html5.RadioGroup = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.order = []; // A list of ids to track order (maps are not order preserving)
            properties.dsid = properties.dsid || cajeta.ds.LOCAL;
            self.super.initialize.call(this, properties);
        },

        addChild: function(child) {
            var self = (arguments.length > 1) ? arguments[1] : this;
            self.super.addChild.call(this, child);
            this.order.push(child.id);
        },


        getComponentValue: function() {
            var value = null;

            for (var cid in this.children) {
                if (cid !== undefined) {
                    if (this.children[cid].getComponentValue() == true) {
                        value = cid;
                        break;
                    }
                }
            }
            return value;
        },
        setComponentValue: function(value, internal) {
            for (var cid in this.children) {
                if (cid !== undefined) {
                    this.children[cid].setComponentValue(cid == value, true);
                }
            }
            if (internal === undefined || internal == false) {
                this.onComponentChanged();
            }
        },
        /**
         * There will be no corresponding markup in the template to support groups, so we override dock...
         */
        dock: function() {
            if (!this.isDocked()) {
                // Add to the application component map at this point.
                model.components[this.cid] = this;

                // Compute the modelPath
                this.populateModelPath();

                // First, if a modelValue has been declared, this will override the existing HTML, or even
                // child component settings.  If we don't have a modelValue declared, then we need to get the
                // value from the children.  If nothing has been selected, then we should declare the first
                // child automatically set.  The resulting cid will be used to initialize the model.
                var value = undefined;
                if (this.modelValue !== undefined) {
                    this.setComponentValue(this.modelValue);
                    delete this.modelValue;
                } else {
                    // Check and see if there's a value in the model that we should use...
                    value = model.getByComponent(this);
                    if (value !== undefined) {
                        this.setComponentValue(value, true);
                    } else {
                        // Use the existing state (if set in HTML) for the value
                        value = this.getComponentValue();
                        model.setByComponent(this);
                        if (value === undefined) {
                            this.setComponentValue(this.order[0]);
                        }
                    }
                }

                // Bind the component to the model
                cajeta.message.dispatch.subscribe('model:publish', this, {
                    id: cajeta.message.MESSAGE_MODEL_NODEADDED,
                    modelPath: this.modelPath,
                    dsid: this.dsid
                });
            }
        }
    });

    /**
     *
     *
     */
    cajeta.view.html5.Select = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            properties.elementType = 'select';
            properties.dsid = properties.dsid || cajeta.ds.LOCAL;
            properties.selectedType = properties.selectedType || 'index'; // value || index
            self.super.initialize.call(this, properties);
            if (this.factory !== undefined) {
                this.factory.parent = this;
            }
        },

        selectedIndex: function(value) {
            if (arguments.length > 0) {
                if (this.selectedType == 'index')
                    this.prop('selectedIndex', value);
                else
                    this.dom.val(value);
            } else {
                if (this.isDocked()) {
                    var value;
                    if (this.selectedType == 'index') {
                        value = this.dom.val(); //this.prop('selectedIndex');
                    } else {
                        value = this.dom.val();
                    }
                    return value;
                } else {
                    return this.attributes['value'];
                }
            }
        },
        getComponentValue: function() {
            return this.selectedIndex();
        },

        setComponentValue: function(value, internal) {
            this.selectedIndex(value);

            if (internal === undefined || internal == false) {
                this.onComponentChanged();
            }
        },

        _onHtmlChange: function(event) {
            this.onComponentChanged();
        }
    });

    /**
     *
     */
    cajeta.view.html5.Image = cajeta.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            properties.elementType = 'img';
            properties.modelEncoding = 'attr:src';
            self.super.initialize.call(this, properties);
        },
        dock: function() {
            if (!this.isDocked()) {
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);

            }
        }
    });

    cajeta.view.html5.TabList = cajeta.view.html5.UnorderedList.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            if (properties['content'] !== undefined) {
                properties.content = properties['content'];
            } else {
                var contentId = properties['contentId'] || 'content';
                properties.content = new cajeta.view.html5.Div({ cid: contentId });
            }
            properties.tabEntries = new Array();
            properties.selectedIndex = 0;
            self.super.initialize.call(this, properties);
        },

        setPage: function(page) {
            var self = (arguments.length > 1) ? arguments[1] : this;
            self.super.setPage.call(this, page, self.super);
            for (var id in this.tabEntries) {
                this.tabEntries[id].component.setPage(page);
            }
        },

        /**
         * Custom override for dock.  The child components are rendered in series to the content div. CSS tags
         * are then used to show only one child at a time.
         *
         * TODO:  Either this is failing to dock every page, or (if that's not desirable) the onTab handler is failing
         * to dock children when they're active.
         */
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
                    eventData['fnName'] = '_onTabClick';
                    eventData['index'] = i;
                    listItem.click(eventData, cajeta.view.Component.htmlEventDispatch);
                    this.dom.append(listItem);
                    this.tabEntries[i].component.css("display", i == 0 ? "" : "none");
                    this.content.dom.append(this.tabEntries[i].component.template);
                }
            }
        },

        /**
         * We add tab entries as children, but they're not represented as unique, docked elements.
         * Instead, we append each child to the same content element, and use CSS to toggle between
         * visible and hidden states.
         *
         * @param tabEntry
         */
        addChild: function(tabEntry) {
            if (tabEntry.component === undefined || tabEntry.title === undefined)
                throw new Error(cajeta.view.html5.ERROR_TABLIST_INVALID_TABENTRY.format(this.cid));
            if (tabEntry.component.template === undefined)
                throw new Error(cajeta.view.html5.ERROR_TABLIST_TABENTRYTEMPLATE_UNDEFINED.format(
                    tabEntry.component.id, this.cid));

            if (this.page !== undefined)
                tabEntry.component.page = this.page;

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

        /**
         *
         * @param event
         * @private
         */
        _onTabClick: function(event) {
            var index = event.data['index'];
            //console.log("Selected index was " + index);
            if (index !== undefined && index != this.selectedIndex) {
                this.tabEntries[this.selectedIndex].component.css('display', 'none');
                this.selectedIndex = index;
                this.tabEntries[this.selectedIndex].component.css('display', '');
                this.tabEntries[this.selectedIndex].component.render(this, self.super);
            }
        }
    });


    return cajeta;
});
