/**
 * cajeta.view.html4.js
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
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.'
 */

define(['cajeta'], function(cajeta) {
    cajeta.View.Link = cajeta.View.Component.extend({
        initialize: function(componentId) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
        },
        onHtmlClicked: function(event) {

        }
    });

    cajeta.View.Span = cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'span';
        },
        onModelUpdate: function() {
            if (this.html === undefined)
                throw 'html was undefined for componentId ' + this.componentId;

            this.html.attr('value', cajeta.theApplication.getModel().getByPath(this.modelPath));
        }
    });

    cajeta.View.Label = cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'label';
            this.attrFor = '';
        },
        setAttrFor: function(attrFor) {
            this.attrFor = attrFor;
            if (this.html !== undefined)
                this.html.attr('for', attrFor);
        },
        getAttrFor: function() {
            if (this.html === undefined)
                throw 'html was undefined for componentId ' + this.componentId;
            return this.html.attr('for');
        },
        setElementValue: function(value) {

        },
        getElementValue: function() {
            if (this.html === undefined)
                throw 'html was undefined for componentId ' + this.componentId;
            return this.html.val();
        },
        onModelUpdate: function() {
            if (this.html === undefined)
                throw 'html was undefined for componentId ' + this.componentId;

            this.html.attr('value', cajeta.theApplication.getModel().getByPath(this.modelPath));
        }
    });

    /**
     *
     */
    cajeta.View.Input = cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.elementType = 'input';
            this.attrName = 'default';
            this.attrType = 'default';
        },
        setAttrName: function(name) {
            this.attrName = name;
            if (this.html !== undefined)
                this.html.attr('name', name);
        },
        getAttrName: function() {
            if (this.html === undefined)
                throw 'html was undefined for componentId ' + this.componentId;

            return this.html.attr('name');
        }
    });

    /**
     *
     */
    cajeta.View.TextInput = cajeta.View.Input.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
        },
        setValue: function(value) {
            this.html.attr('value', value);
            cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        },
        onModelUpdate: function() {
            this.html.attr('value', cajeta.theApplication.getModel().getByPath(this.modelPath));
        },
        onHtmlChange: function(event) {
            cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        }
    });

    /**
     *
     */
    cajeta.View.RadioInput = cajeta.View.Input.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
        },
        onModelUpdate: function() {
            this.html.attr('value', cajeta.theApplication.getModel().getByPath(this.modelPath));
        },
        onHtmlChange: function(event) {
            cajeta.theApplication.getModel().setByPath(this.modelPath, this.html.attr('value'), this);
        }
    });

    /**
     *
     */
    cajeta.View.Form = cajeta.View.Component.extend({
        initialize: function(componentId, modelPath, defaultValue) {
            var self = (arguments.length > 3) ? arguments[3] : this;
            self.super.initialize.call(this, componentId, modelPath, defaultValue, self.super);
            this.setElementType('form');
        },
        onHtmlSubmit: function() {
            alert('Got a submit!');
        }
    });

    return cajeta;
});