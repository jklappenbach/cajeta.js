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

define(['jquery', 'cajeta', 'html5'], function($, Cajeta, Html5) {
    Cajeta.View.Html5.Svg = { }

    Cajeta.View.Html5.Svg.Svg = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'svg';
        }
    });

    Cajeta.View.Html5.Svg.Group = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'g';
        }
    });

    Cajeta.View.Html5.Svg.Definitions = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'defs';
        }
    });

    Cajeta.View.Html5.Svg.LinearGradient = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'linearGradient';
        }
    });

    Cajeta.View.Html5.Svg.RadialGradient = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'linearGradient';
        }
    });

    Cajeta.View.Html5.Svg.GradientStop = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'stop';
        }
    });

    Cajeta.View.Html5.Svg.Path = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'path';
        }
    });

    Cajeta.View.Html5.Svg.Pattern = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'pattern';
        }
    });

    Cajeta.View.Html5.Svg.ClipPath = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'clipPath';
        }
    });

    Cajeta.View.Html5.Svg.Mask = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'mask';
        }
    });

    Cajeta.View.Html5.Svg.Rectangle = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'rect';
        }
    });
    Cajeta.View.Html5.Svg.Circle = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'circle';
        }
    });

    Cajeta.View.Html5.Svg.Ellipse = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'ellipse';
        }
    });

    Cajeta.View.Html5.Svg.Line = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'line';
        }
    });

    Cajeta.View.Html5.Svg.PolyLine = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'polyline';
        }
    });

    Cajeta.View.Html5.Svg.Polygon = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'polygon';
        }
    });

    Cajeta.View.Html5.Svg.Font = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font';
        }
    });
    Cajeta.View.Html5.Svg.Glyph = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'glyph';
        }
    });
    Cajeta.View.Html5.Svg.MissingGlyph = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'missing-glyph';
        }
    });
    Cajeta.View.Html5.Svg.HorizontalKern = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'hkern';
        }
    });
    Cajeta.View.Html5.Svg.VerticalKern = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'vkern';
        }
    });

    Cajeta.View.Html5.Svg.FontFace = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face';
        }
    });
    Cajeta.View.Html5.Svg.FontFaceSource = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-src';
        }
    });
    Cajeta.View.Html5.Svg.FontFaceUri = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-uri';
        }
    });
    Cajeta.View.Html5.Svg.FontFaceFormat = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-format';
        }
    });
    Cajeta.View.Html5.Svg.FontFaceName = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'font-face-name';
        }
    });

    Cajeta.View.Html5.Svg.Text = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'text';
        }
    });

    Cajeta.View.Html5.Svg.TextSpan = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'tspan';
        }
    });

    Cajeta.View.Html5.Svg.Marker = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'marker';
        }
    });

    Cajeta.View.Html5.Svg.ColorProfile = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'color-profile';
        }
    });

    Cajeta.View.Html5.Svg.Metadata = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'metadata';
        }
    });

    Cajeta.View.Html5.Svg.Style = Cajeta.View.Component.extend({
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
    Cajeta.View.Html5.Svg.Filter = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'filter';
        }
    });

    Cajeta.View.Html5.Svg.View = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'view';
        }
    });

    Cajeta.View.Html5.Svg.Description = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'desc';
        }
    });
    Cajeta.View.Html5.Svg.Script = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'script';
        }
    });

    Cajeta.View.Html5.Svg.Animate = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animate';
        }
    });
    Cajeta.View.Html5.Svg.Set = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'set';
        }
    });
    Cajeta.View.Html5.Svg.AnimateMotion = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animationMotion';
        }
    });
    Cajeta.View.Html5.Svg.AnimateColor = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateColor';
        }
    });
    Cajeta.View.Html5.Svg.AnimateTransform = Cajeta.View.Component.extend({
        initialize: function(properties) {
            var self = (properties.self === undefined) ? this : properties.self;
            properties.self = self.super;
            self.super.initialize.call(this, properties);
            this.elementType = 'animateTransform';
        }
    });

    return Cajeta.View.Html5.Svg;
});
