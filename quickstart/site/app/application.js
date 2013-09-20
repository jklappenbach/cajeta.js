define(['jquery', 'cajeta', 'homePage', 'model'], function($, Cajeta, homePage, model) {
    var app = new Cajeta.Application({
        id: 'demoApplication'
    });

    Cajeta.Datasource.set(new Cajeta.Datasource.AjaxDS({
        header: {
            'Accept' : "application/json; charset=UTF-8",
            'Content-Type' : "application/x-www-form-urlencoded; charset=UTF-8"
        },
        encoding: 'application/json',
        uriTemplate: 'http://localhost:8080/application/users/{userId}',
        id: 'dsApp',
        modelPath: 'application.user.response'
    }));

    app.addPage(homePage);
    return app;
});