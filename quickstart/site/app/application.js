define(['jquery', 'infusion', 'homePage'], function($, infusion, homePage) {
    var app = new infusion.Application({
        id: 'quickstartApp'
    });

    app.addPage(homePage);
    return app;
});
