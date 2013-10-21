/**
 * Creates a map of datasources for the application to use.  This is, effectively, IoC, where testing environments
 * can specify a set of memory or mocked interfaces for datasources for testing purposes.
 */
define(['infusion.ds'], function(infusion) {
    var ds = {};

    /**
     * Add the datasource for the model's state
     */
    ds[infusion.ds.STATE_DATASOURCE_ID] = new infusion.ds.DefaultStateDS({
        id: infusion.ds.STATE_DATASOURCE_ID,
        applicationId: 'defaultAppId'
    });

    /**
     * Add the application dependencies for release.  These can be substituted for debug / testing with mocked versions
     * using require.js
     */
    ds['formExampleDS'] = new infusion.ds.AjaxDS({
        id: 'formExampleDS',
        headers: {
            'Accept': "application/json; charset=UTF-8",
            'Content-Type': "application/json; charset=UTF-8"
        },
        uriTemplate: 'http://localhost:8888/formExample/selectSet'
    });

    return ds;
});