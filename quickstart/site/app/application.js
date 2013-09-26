define(['jquery', 'cajeta', 'homePage', 'model'], function($, Cajeta, homePage, model) {
    var app = new Cajeta.Application({
        id: 'demoApplication'
    });

    // TODO: Instate an AJAX datasource for stateCache
//    Cajeta.Datasource.set(new Cajeta.Datasource.AjaxDS({
//        header: {
//            'Accept' : "application/json; charset=UTF-8",
//            'Content-Type' : "application/json; charset=UTF-8"
//        },
//        encoding: 'application/json',
//        uriTemplate: 'http://localhost:8080/application/users/{userId}',
//        id: Cajeta.Model.STATECACHE_DATASOURCE_ID,
//        modelPath: 'application.user.response'
//    }));

    app.addPage(homePage);
    return app;
});