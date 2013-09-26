/**
 * File: cajeta.html5.svg.js
 *
 * This module contains the definitions for HTML5 based SVG components.
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

define(['jquery', 'cajetaView', 'html5'], function($, cajeta, html5) {
    cajeta.view.html5.Svg = { }

    cajeta.view.html5.Svg.Svg = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'svg';
        }
    });

    cajeta.view.html5.Svg.Group = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'g';
        }
    });

    cajeta.view.html5.Svg.Definitions = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'defs';
        }
    });

    cajeta.view.html5.Svg.LinearGradient = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'linearGradient';
        }
    });

    cajeta.view.html5.Svg.RadialGradient = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'linearGradient';
        }
    });

    cajeta.view.html5.Svg.GradientStop = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'stop';
        }
    });

    cajeta.view.html5.Svg.Path = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'path';
        }
    });

    cajeta.view.html5.Svg.Pattern = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'pattern';
        }
    });

    cajeta.view.html5.Svg.ClipPath = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'clipPath';
        }
    });

    cajeta.view.html5.Svg.Mask = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'mask';
        }
    });

    cajeta.view.html5.Svg.Rectangle = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'rect';
        }
    });
    cajeta.view.html5.Svg.Circle = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'circle';
        }
    });

    cajeta.view.html5.Svg.Ellipse = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'ellipse';
        }
    });

    cajeta.view.html5.Svg.Line = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'line';
        }
    });

    cajeta.view.html5.Svg.PolyLine = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'polyline';
        }
    });

    cajeta.view.html5.Svg.Polygon = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'polygon';
        }
    });

    cajeta.view.html5.Svg.Font = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font';
        }
    });
    cajeta.view.html5.Svg.Glyph = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'glyph';
        }
    });
    cajeta.view.html5.Svg.MissingGlyph = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'missing-glyph';
        }
    });
    cajeta.view.html5.Svg.HorizontalKern = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'hkern';
        }
    });
    cajeta.view.html5.Svg.VerticalKern = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'vkern';
        }
    });

    cajeta.view.html5.Svg.FontFace = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face';
        }
    });
    cajeta.view.html5.Svg.FontFaceSource = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-src';
        }
    });
    cajeta.view.html5.Svg.FontFaceUri = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-uri';
        }
    });
    cajeta.view.html5.Svg.FontFaceFormat = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-format';
        }
    });
    cajeta.view.html5.Svg.FontFaceName = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-name';
        }
    });

    cajeta.view.html5.Svg.Text = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'text';
        }
    });

    cajeta.view.html5.Svg.TextSpan = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'tspan';
        }
    });

    cajeta.view.html5.Svg.Marker = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'marker';
        }
    });

    cajeta.view.html5.Svg.ColorProfile = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'color-profile';
        }
    });

    cajeta.view.html5.Svg.Metadata = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'metadata';
        }
    });

    cajeta.view.html5.Svg.Style = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'style';
        }
    });

    /**
     * Filter logic will need to manage all of these types, either as explicit components, or internally
     * managed elements
     *
     * Light Source
     * 15.8.2 Light source ‘feDistantLight’
     * 15.8.3 Light source ‘fePointLight’
     * 15.8.4 Light source ‘feSpotLight’
     *
     * Blurs and Transforms
     * 15.9 Filter primitive ‘feBlend’
     * 15.10 Filter primitive ‘feColorMatrix’
     * 15.11 Filter primitive ‘feComponentTransfer’
     * 15.12 Filter primitive ‘feComposite’
     * 15.13 Filter primitive ‘feConvolveMatrix’
     * 15.14 Filter primitive ‘feDiffuseLighting’
     * 15.15 Filter primitive ‘feDisplacementMap’
     * 15.16 Filter primitive ‘feFlood’
     * 15.17 Filter primitive ‘feGaussianBlur’
     * 15.18 Filter primitive ‘feImage’
     * 15.19 Filter primitive ‘feMerge’
     * 15.20 Filter primitive ‘feMorphology’
     * 15.21 Filter primitive ‘feOffset’
     * 15.22 Filter primitive ‘feSpecularLighting’
     * 15.23 Filter primitive ‘feTile’
     * 15.24 Filter primitive ‘feTurbulence’
     * @type {*}
     */
    cajeta.view.html5.Svg.Filter = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'filter';
        }
    });

    cajeta.view.html5.Svg.view = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'view';
        }
    });

    cajeta.view.html5.Svg.Description = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'desc';
        }
    });
    cajeta.view.html5.Svg.Script = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'script';
        }
    });

    cajeta.view.html5.Svg.Animate = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animate';
        }
    });
    cajeta.view.html5.Svg.Set = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'set';
        }
    });
    cajeta.view.html5.Svg.AnimateMotion = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateMotion';
        }
    });
    cajeta.view.html5.Svg.AnimateColor = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateColor';
        }
    });
    cajeta.view.html5.Svg.AnimateTransform = cajeta.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateTransform';
        }
    });

    return cajeta.view.html5.Svg;
});
