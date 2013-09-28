define(['jquery', 'cajeta', 'homePage', 'model'], function($, cajeta, homePage, model) {
    var app = new cajeta.Application({
        id: 'demoApplication'
    });

    app.addPage(homePage);
    return app;
});