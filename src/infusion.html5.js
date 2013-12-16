/**
 * File: infusion.html5.js
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

define(['jquery', 'infusion.view', 'model', 'ds', 'l10n'], function($, infusion, model, ds, l10n) {
    infusion.view.html5 = {
        author: 'Julian Klappenbach',
        version: '0.0.1',
        license: 'MIT 2013',
        ERROR_TABLIST_INVALID_TABENTRY: 'A TabEntry was submitted to tabControl "{0}" with missing attributes.',
        ERROR_TABLIST_TABENTRYTEMPLATE_UNDEFINED: 'TabEntry "{0}" submitted to tabControl "{1}" with no template.'
    };

    infusion.view.html5.Div = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'div';
            properties.modelEncoding = 'text';
            self.super.initialize.call(this, properties);
        }
    });

    infusion.view.html5.Button = infusion.view.Component.extend({
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

    infusion.view.html5.UnorderedList = infusion.view.Component.extend({
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

    infusion.view.html5.Table = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'table';
            self.super.initialize.call(this, properties);
        }
    });

    infusion.view.html5.TableRow = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'tr';
            self.super.initialize.call(this, properties);
        }
    });

    infusion.view.html5.TableDivision = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'td';
            self.super.initialize.call(this, properties);
        }
    });

    infusion.view.html5.Link = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'a';
            properties.modelEncoding = "attr:href";
            self.super.initialize.call(this, properties);
        }
    });

    infusion.view.html5.Span = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'span';
            properties.modelEncoding = "text";
            self.super.initialize.call(this, properties);
        }
    });

    infusion.view.html5.Label = infusion.view.Component.extend({
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
    infusion.view.html5.Input = infusion.view.Component.extend({
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
    infusion.view.html5.TextInput = infusion.view.html5.Input.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.dsid = properties.dsid || infusion.ds.LOCAL;
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
     * State handling should be provided by infusion.View.ComponentGroup.
     */
    infusion.view.html5.RadioInput = infusion.view.html5.Input.extend({
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
    infusion.view.html5.CheckboxInput = infusion.view.html5.Input.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.modelEncoding = 'prop:checked';
            properties.dsid = properties.dsid || infusion.ds.LOCAL;
            self.super.initialize.call(this, properties);
        }
    });

    /**
     *
     */
    infusion.view.html5.TextArea = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.elementType = 'textarea';
            properties.modelEncoding = 'text';
            properties.dsid = properties.dsid || infusion.ds.LOCAL;
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
    infusion.view.html5.Legend = infusion.view.Component.extend({
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
     * practical method of assuring exclusive checked-state.  infusion.View.Html5.RadioGroup provides a container
     * for the
     *
     */
    infusion.view.html5.RadioGroup = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            properties.order = []; // A list of ids to track order (maps are not order preserving)
            properties.dsid = properties.dsid || infusion.ds.LOCAL;
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
                infusion.message.dispatch.subscribe({
                    topic: 'model:publish',
                    subscriber: this,
                    criteria: {
                        id: infusion.model.MESSAGE_MODEL_SETNODE,
                        modelPath: this.modelPath,
                        dsid: this.dsid
                    }
                });
            }
        }
    });

    /**
     *
     *
     */
    infusion.view.html5.Select = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            properties.elementType = 'select';
            properties.dsid = properties.dsid || infusion.ds.LOCAL;
            properties.selectedType = properties.selectedType || 'index'; // value || index
            self.super.initialize.call(this, properties);
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
    infusion.view.html5.Image = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            properties.elementType = 'img';
            properties.modelEncoding = 'attr:src';
            self.super.initialize.call(this, properties);
        }
    });

    infusion.view.html5.TabList = infusion.view.html5.UnorderedList.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = properties.self || this;
            properties.self = self.super;
            if (properties['content'] !== undefined) {
                properties.content = properties['content'];
            } else {
                var contentId = properties['contentId'] || 'content';
                properties.content = new infusion.view.html5.Div({ cid: contentId });
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

        getDom: function() {
            return this.content.dom;
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
                this.content.getDom().empty();

                for (var i = 0; i < this.tabEntries.length; i++) {
                    var listItem = this.listItemHtml.clone();
                    listItem.text(l10n.translate(this.tabEntries[i].title));
                    var eventData = { index: i };

                    listItem.click(eventData, function(data) {
                        self._onTabClick(data);
                    });
                    this.dom.append(listItem);
                    this.tabEntries[i].listItem = listItem;

                    if (i == 0) {
                        this.tabEntries[i].listItem.addClass('selected');
                    } else {
                        this.tabEntries[i].component.css('display', 'none');
                    }
                    this.tabEntries[i].component.inject();
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
            if (!(tabEntry.component instanceof infusion.view.html5.TabList)) {
                if (tabEntry.component === undefined || tabEntry.title === undefined)
                    throw new Error(infusion.view.html5.ERROR_TABLIST_INVALID_TABENTRY.format(this.getCanonicalId()));
                if (tabEntry.component.template === undefined && tabEntry.component.tid === undefined)
                    throw new Error(infusion.view.html5.ERROR_TABLIST_TABENTRYTEMPLATE_UNDEFINED.format(
                        tabEntry.component.cid, this.getCanonicalId()));
            }

            if (this.page !== undefined)
                tabEntry.component.page = this.page;

            tabEntry.component.parent = this;

            // We set the contentId to dock using existing logic
            this.tabEntries.push(tabEntry);
        },

        /**
         *
         * @param event
         * @private
         */
        _onTabClick: function(event) {
            var index = event.data['index'];
            this.setSelectedIndex(index);
        },

        setSelectedIndex: function(index) {
            if (index != this.selectedIndex) {
                this.tabEntries[this.selectedIndex].component.css('display', 'none');
                this.tabEntries[this.selectedIndex].listItem.removeClass('selected');
                this.tabEntries[index].component.css('display', '');
                this.tabEntries[index].listItem.addClass('selected');
                this.selectedIndex = index;
            }
        },

        /**
         * Returns the viewstate of this tab, which is the component Id and the
         * selected index of the tab.  The format for the viewstate must be uri compliant,
         * and not exceed common browser limitations on length.
         *
         * In the case of tabs, the index is indicated using array brackets.
         *
         * @return {String}
         */
        getViewState: function() {
            var viewState = this.cid + '[' + this.selectedIndex + ']';
            for (var cid in this.children) {
                var childState = this.children[cid].getViewState();
                if (childState != '')
                    viewState += '/' + childState;
            }
            return viewStateId;
        },

        setViewState: function(parameters) {
            if (parameters.viewState === undefined)
                throw new Error('arugments.viewState is undefined');
            var states = parameters.viewState.split('/');
            var index = states[0].indexOf(this.cid);
            if (index >= 0) {
                index = states[0].indexOf('[');
                this.setSelectedIndex(new Number(states[0].substring(index, states[0].indexOf(']'))));

                parameters.viewState = parameters.viewState
            }
        }
    });

    /**
     *
     * @type {void|Object|child.extend|*|jQuery.extend}
     */
    infusion.view.html5.Calendar = infusion.view.Component.extend({
        initialize: function(properties) {
            properties = properties || {};
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            properties.elementType = 'section';
            properties.modelEncoding = 'attr:selection';
            self.super.initialize.call(this, properties);

            if (this.dsid !== undefined) {
                this.ds = ds[this.dsid];
            }

            if (this.date === undefined) {
                this.date = new Date();
            }

            this.navigation = this.navigation || 'fixed';
        },

        /**
         *
         * @param year
         * @param month
         * @returns {number}
         */
        daysInMonth: function(year, month) {
            // January, March, May, July, August, October, and December
            if (month == 4 || month == 6 || month == 9) {
                return 30;
            } else if (month == 2) {
                if (year % 4) {
                    return 28;
                } else {
                    return 29;
                }
            } else {
                return 31;
            }
        },

        /**
         *
         */
        dock: function() {
            if (!this.isDocked()) {
                // First, dock to our target element
                var self = (arguments.length > 0) ? arguments[0] : this;
                self.super.dock.call(this, self.super);

                var year = this.date.getYear();
                var month = this.date.getMonth();
                var canvas = this.generateTable(year, month);
                this.dom.empty();
                this.dom.html(canvas[0].outerHTML);
            }
        },

        /**
         *
         * @param months
         */
        addMonth: function(months) {
            var canvas = this.generateTable(this.date.getFullYear(), this.date.getMonth() + months);
            this.dom.empty();
            this.dom.html(canvas[0].outerHTML);
        },

        /**
         *
         * @param years
         */
        addYear: function(years) {
            var canvas = this.generateTable(this.date.getFullYear() + years, this.date.getMonth());
            this.dom.empty();
            this.dom.html(canvas[0].outerHTML);
        },

        /**
         *
         */
        currentDate: function() {
            this.date = new Date();
            var canvas = this.generateTable(this.date.getFullYear(), this.date.getMonth());
            this.dom.html(canvas[0].outerHTML);
        },

        /**
         *
         * @param date
         */
        onDayClicked: function(date) {
            // Override / mixin to provide your own handler
        },

        /**
         *
         * @param year
         * @param month
         * @returns {*|HTMLElement}
         */
        generateTable: function(year, month) {
            var row = 0;

            // If we have a datasource defined, invoke it with our month and year to get the list of
            // events and links
            var dates = null;
            if (this.ds !== undefined) {
                dates = ds.get({
                    year: year,
                    month: month,
                    async: false
                });
            }

            var canvas = $('<div class="calendar-canvas" />');
            var table = $('<table class="calendar"/>');
            canvas.append(table);

            var thead = $('<thead/>');
            canvas.append(thead);

            var self = this;
            if (this.navigation != 'fixed') {
                var tr = $('<tr class="navigation"/>');
                thead.append(tr);
                var td = $('<td class="prevYear">&lt;&lt;</td>');
                td.click(function() { self.addYear(-1); });
                tr.append(td);
                td = $('<td class="prevMonth">&lt;</td>');
                td.click(function() { self.addMonth(-1); });
                tr.append(td);
                td = $('<td />');
                tr.append(td);
                td = $('<td class="today">*</td>');
                td.click(function() { self.currentDate(); });
                tr.append(td);
                td = $('<td class="nextMonth">&gt;</td>');
                td.click(function() { self.addMonth(1); });
                tr.append(td);
                td = $('<td class="nextYear">&gt;&gt;</td>');
                td.click(function() { self.addYear(1); });
                tr.append(td);
            }

            var array = ['<tr class="weekdays">'];
            for (var i = 0; i < 7; i++) {
                array.push('<th scope="col" title="' + l10n.weekdays[i] + '">' + l10n.abbrWeekdays[i] + '</th>');
            }
            array.push('</tr>');
            table.append($('<caption>' + l10n.months[month] + ' ' + year + '</caption>'));
            table.append($(array.join('')));

            var tbody = $('<tbody />');
            var tr, date;
            for (var i = 1; i <= this.daysInMonth(year, month); i++) {
                date = new Date(year, month, i, 0, 0, 0);
                var td;
                if (date.getDay() == 0) {
                    tr = $('<tr />');
                    if (i % 2)
                        tr.addClass('odd');
                    tbody.append(tr);
                }

                // Pad the first row for days, starting with Sunday
                if (row == 0 && i == 1) {
                    td = $('<td colspan="' + date.getDay() + '" class="pad"><span>&nbsp;</span></td>');
                } else {
                    if (this.events != null) {
                        if (this.events[date.toDateString()] !== undefined) {
                            td = $('<td class="event-day">' + date.getDate() + '</td>');
                        } else {
                            td = $('<td class="day"><span>' + date.getDate() + '</span></td>');
                        }
                    }
                    td.click(self.onDayClicked(date));
                    td = $('<td><span>' + date.getDate() + '</span></td>');
                }
                tr.append(td);
            }
            if (date.getDay() < 6)
                tr.append($('<td colspan="' + (6 - date.getDay()) + '" class="pad" />'))

            return canvas;
        }
    });


    return infusion;
});
