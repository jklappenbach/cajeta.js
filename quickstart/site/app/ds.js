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

    // TODO: Add your own datasource populations here

    return ds;
});
