/**
 * Created by julian on 11/2/13.
 */
define(['jquery', 'infusion.core', 'ds'], function($, infusion, ds) {
    infusion.resource = {};

    infusion.resource.L10n = infusion.Class.extend({
        initialize: function(properties) {
            if (properties !== undefined)
                $.extend(true, this, properties);
            this.dsid = this.dsid || 'l10n';
            this.ds = ds[this.dsid];
            this.strings = this.strings || {};
        },

        setLocale: function(locale) {
            if (locale != this.locale) {
                this.locale = locale;
                this.ds.get({
                    locale: this.locale,
                    onSuccess: this._onResponse,
                    async: true
                });
            }
        },
        translate: function(key) {
            var result = key;
            if (this.data.strings.hasOwnProperty(key)) {
                result = this.data.strings[key];
            }
            return result;
        },
        _onResponse: function(parameters) {
            this.data = parameters.msg.data;

            // Install new css, fonts by updating link hrefs
            if (this.data.link !== undefined) {
                for (var id in this.data.link) {
                    var element = $('#' + id);
                    if (element.length > 0) {
                        element.attr('href', this.data.link[id]);
                    }
                }
            }
        }
    });
    return infusion;
});