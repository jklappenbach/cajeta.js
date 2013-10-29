define(['jquery', 'infusion', 'homePage'], function($, infusion, homePage) {
    var app = new infusion.Application({
        id: 'demoApplication'
    });

    app.addPage(homePage);
    return app;
});