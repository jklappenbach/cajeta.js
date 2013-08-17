/**
 * Created with JetBrains WebStorm.
 * User: julian
 * Date: 8/4/13
 * Time: 4:19 PM
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'cajetaView',
    'jcookies'
], function($, Cajeta, jCookies) {
    /**
     *
     *
     */
    Cajeta.Application = Cajeta.Class.extend({
        initialize: function(properties) {
            $.extend(this, properties);
            if (this.id === undefined)
                throw 'Error: Cajeta.Application.id must be defined';

            this.viewStateAliasMap = {};
            this.anchor = '';
            this.viewStateId = '';
            this.modelStateId = '';

            this.componentMap = {};
            this.stringResourceMap = {};
            this.currentPage = null;
            this.executing = false;

            if (this.model === undefined) {
                this.model = new Cajeta.Model.ModelCache({
                    applicationId: this.id || 'defaultAppId',
                    enableHistory: true,
                    enableJsonDelta: true
                });
            }

            this.model.set('applicationId', this.id);
        },

        /**
         * Returns the current anchor state of the application, a string encoding both view and model state.
         * Override this to provide platform appropriate logic.
         *
         * @return {String}
         */
        getUrlAnchor: function() {
            return window.location.hash;
        },

        setUrlAnchor: function(anchor) {
            window.location.hash = anchor;
        },

        /**
         * Called after all application initialization has been performed.  These tasks may include population
         * of all components and initialization of model state.  The application logic will also check for the
         * current anchor for additional state information.
         */
        execute: function() {
            if (this.executing == false) {
                if ("onhashchange" in window) { //&& !($.browser.msie)) {
                    window.onhashchange = Cajeta.Application.onAnchorChanged;
                } else {
                    // Quick and dirty to detect anchor hash change for primitive browsers
                    var prevHash = window.location.hash;
                    window.setInterval(function () {
                        if (window.location.hash != prevHash) {
                            Cajeta.Application.onAnchorChanged();
                        }
                    }, 200);
                }
                this.executing = true;
                this.anchor = this.getUrlAnchor();

                // If we have a page request without an anchor, set it to the defaults
                // for the application, and populate the (browser's) url with the anchor,
                // bootstrapping the render.
                if (this.anchor === undefined || this.anchor == '') {
                    var viewStateId = Cajeta.View.homePage;
                    this.anchor = viewStateId;

                    if (this.model !== undefined && this.model.enableHistory == true) {
                        this.modelStateId = this.model.getStateId();
                        this.anchor += '=' + this.modelStateId;
                    }
                    this.setUrlAnchor(this.anchor);
                } else {
                    // We have recieved a url with an anchor.  Directly call onAnchorChange to
                    // bootstrap the state change, and render
                    this.onAnchorChanged();
                }
            }
        },

        /**
         * Called when the browser or container URL is changed
         */
        onAnchorChanged: function() {
            var urlAnchor = this.getUrlAnchor();
            if (urlAnchor !== undefined && urlAnchor != '') {
                if (this.viewStateAliasMap.hasOwnProperty(urlAnchor)) {
                    this.anchor = this.viewStateAliasMap[urlAnchor];
                }
                this.anchor = urlAnchor;

                // First, ensure it's valid
                var states = urlAnchor.split('=');
                this.setViewStateId(states[0].substring(1), true);
                var validAnchor = "#" + this.viewStateId;
                var validModelId;
//                if (this.model.isHistoryEnabled()) {
//                    if (states.length > 1) {
//                        this.setModelStateId(states[1]);
//                        validModelId = this.model.getStateId();
//                    } else if (this.model.isHistoryEnabled() == true) {
//                        validModelId = this.modelStateId = this.model.getStateId();
//                    }
//                    validAnchor += '=' + validModelId;
//                }

                // Prevent bogus data in the anchor
                if (this.anchor != validAnchor) {
                    this.viewStateAliasMap[this.anchor] = validAnchor;
                    this.anchor = validAnchor;
                }
            } else {
                // The url was incorrectly modified.  Go back to default state
                this.setUrlAnchor(Cajeta.View.homePage + "=" + this.model.getStateId());
            }
        },

        /**
         * Called with the model is updated
         */
        onModelChanged: function() {
            this.anchor = '#' + this.viewStateId + '=' + this.model.getStateId();
            this.setUrlAnchor(this.anchor);
        },

        /**
         * Returns the instance of the data model for the application.
         *
         * @return Cajeta.Model
         */
        getModel: function() {
            return this.model;
        },

        /**
         * The top level render call, invoked by the script receiving the request.  The anchor of the url
         * will be used by the component hierarchy to determine how to render the application.  The form of
         * the url, and the anchor will be:
         *
         * [COMPONENT_ID][*:[COMPONENT_ID]][?=[MODEL_STATE]]
         *
         *  The entire anchor constitutes an application component state by defining both view and model,
         *  and optionally, the state of any controls or settings  within a component.  The block is generated
         *  by serializing each component in a depth-first iteration where each component  provides it's component
         *  ID.  From this, each component can know the state of it's children, and render an arbitrary
         *  application state from a request.  The optional state hash can either be directly interpreted as data
         *  (for simple cases), or be used as a key into an existing database, cookie, or remote service to
         *  recall larger datasets.
         *
         */
        render: function() {
            this.currentPage.render();
        },

        getComponentMap: function() {
            return this.componentMap;
        },

        /**
         * Add a page to the application.
         *
         * @param page The page to add
         */
        addPage: function(page) {
            this.componentMap[page.getId()] = page;
            if (this.currentPage == null) {
                this.currentPage = page;
            }
        },

        /**
         *
         * @param page
         * @param fromUrl
         */
        setCurrentPage: function(page, fromUrl) {
            var component;
            if (page instanceof Cajeta.View.Component) {
                component = page;
            } else {
                component = this.componentMap[page];
            }

            if (component === undefined)
                throw Cajeta.str.ERROR_APPLICATION_PAGE_UNDEFINED.format(page);

            if (this.currentPage !== undefined) {
                if (this.currentPage != component) {
                    this.currentPage.undock();
                    this.currentPage = component;
                }
            } else {
                this.currentPage = component;
            }
        },

        /**
         *
         * @param viewStateId
         * @param fromUrl
         */
        setViewStateId: function(viewStateId, fromUrl) {
            // If the sequence was URL driven, we communicate the state to the view...
            if (fromUrl !== undefined && fromUrl == true) {
                var page;
                // Distribute the viewState over the components...
                var viewStateEntries = viewStateId.split(':');
                for (var i = 0; i < viewStateEntries.length; i++) {
                    var componentState = viewStateEntries[i].split('.');
                    var component = this.componentMap[componentState[0]];
                    if (component !== undefined) {
                        if (componentState.length > 0) {
                            if (i == 0)
                                page = component;
                            if (componentState.length > 1)
                                component.setViewStateId(componentState[1]);
                        }
                    } else {
                        // We have an invalid viewStateId!  Set it to the homePage
                        viewStateId = Cajeta.View.homePage;
                        page = this.componentMap[viewStateId];
                        break;
                    }
                }
                if (this.viewStateId != viewStateId) {
                    this.viewStateId = viewStateId;
                    if (page != this.currentPage)
                        this.setCurrentPage(page, fromUrl);
                    this.render();
                }
            } else {
                // Otherwise, that state already exists in the view, and all that needs to be done is
                // update the internal variable and the URL.
                this.viewStateId = viewStateId;
                this.anchor = '#' + this.viewStateId;
                if (this.modelStateId != '') {
                    this.anchor += '=' + this.modelStateId;
                }
                this.setUrlAnchor(this.anchor);
            }
        },

        /**
         *
         * @param modelState
         */
        setModelStateId: function(modelState) {
            this.modelStateId = modelState;
            this.model.loadState(this.modelStateId);
        },

        /**
         * Add an alias for a particular viewState.  This enables complex view state strings to be
         * substituted with human friendly aliases.
         *
         * @param alias
         * @param viewState
         */
        addViewStateAlias: function(alias, viewState) {
            this.viewStateAliasMap[alias] = viewState;
        },

        /**
         *
         * @param resourceId
         * @return {*}
         */
        getStringResource: function(resourceId) {
            return this.stringResourceMap[resourceId];
        },

        /**
         *
         * @param stringResourceMap
         */
        setStringResourceMap: function(stringResourceMap) {
            this.stringResourceMap = stringResourceMap;
        },

        /**
         *
         * @param locale
         * @param url
         */
        setStringResourceLocale: function(locale, url) {
            // Default behavior: execute XHR to retrieve the string resource map JSON from the server
            // at the provided url.  The returned result will be assumed to be in the proper format.
        }
    });

    /**
     *
     */
    Cajeta.Application.onAnchorChanged = function() {
        Cajeta.theApplication.onAnchorChanged();
    };

    return Cajeta;
});
