/**
 * File: infusion.html5.svg.js
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

define(['jquery', 'infusion.view', 'html5'], function($, infusion, html5) {
    infusion.view.html5.Svg = { }

    infusion.view.html5.Svg.Svg = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'svg';
        }
    });

    infusion.view.html5.Svg.Group = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'g';
        }
    });

    infusion.view.html5.Svg.Definitions = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'defs';
        }
    });

    infusion.view.html5.Svg.LinearGradient = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'linearGradient';
        }
    });

    infusion.view.html5.Svg.RadialGradient = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'linearGradient';
        }
    });

    infusion.view.html5.Svg.GradientStop = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'stop';
        }
    });

    infusion.view.html5.Svg.Path = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'path';
        }
    });

    infusion.view.html5.Svg.Pattern = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'pattern';
        }
    });

    infusion.view.html5.Svg.ClipPath = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'clipPath';
        }
    });

    infusion.view.html5.Svg.Mask = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'mask';
        }
    });

    infusion.view.html5.Svg.Rectangle = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'rect';
        }
    });
    infusion.view.html5.Svg.Circle = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'circle';
        }
    });

    infusion.view.html5.Svg.Ellipse = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'ellipse';
        }
    });

    infusion.view.html5.Svg.Line = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'line';
        }
    });

    infusion.view.html5.Svg.PolyLine = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'polyline';
        }
    });

    infusion.view.html5.Svg.Polygon = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'polygon';
        }
    });

    infusion.view.html5.Svg.Font = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font';
        }
    });
    infusion.view.html5.Svg.Glyph = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'glyph';
        }
    });
    infusion.view.html5.Svg.MissingGlyph = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'missing-glyph';
        }
    });
    infusion.view.html5.Svg.HorizontalKern = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'hkern';
        }
    });
    infusion.view.html5.Svg.VerticalKern = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'vkern';
        }
    });

    infusion.view.html5.Svg.FontFace = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face';
        }
    });
    infusion.view.html5.Svg.FontFaceSource = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-src';
        }
    });
    infusion.view.html5.Svg.FontFaceUri = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-uri';
        }
    });
    infusion.view.html5.Svg.FontFaceFormat = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-format';
        }
    });
    infusion.view.html5.Svg.FontFaceName = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-name';
        }
    });

    infusion.view.html5.Svg.Text = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'text';
        }
    });

    infusion.view.html5.Svg.TextSpan = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'tspan';
        }
    });

    infusion.view.html5.Svg.Marker = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'marker';
        }
    });

    infusion.view.html5.Svg.ColorProfile = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'color-profile';
        }
    });

    infusion.view.html5.Svg.Metadata = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'metadata';
        }
    });

    infusion.view.html5.Svg.Style = infusion.view.Component.extend({
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
    infusion.view.html5.Svg.Filter = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'filter';
        }
    });

    infusion.view.html5.Svg.view = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'view';
        }
    });

    infusion.view.html5.Svg.Description = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'desc';
        }
    });
    infusion.view.html5.Svg.Script = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'script';
        }
    });

    infusion.view.html5.Svg.Animate = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animate';
        }
    });
    infusion.view.html5.Svg.Set = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'set';
        }
    });
    infusion.view.html5.Svg.AnimateMotion = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateMotion';
        }
    });
    infusion.view.html5.Svg.AnimateColor = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateColor';
        }
    });
    infusion.view.html5.Svg.AnimateTransform = infusion.view.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateTransform';
        }
    });

    return infusion.view.html5.Svg;
});
