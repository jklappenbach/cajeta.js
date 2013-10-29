define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/homePage.html'
], function($, infusion, homePageText) {
    // Create an alias for shortening namespacei (if you like)...
    var view = infusion.view;
    var html5 = infusion.view.html5;

    var homePage = new view.Page({ cid: infusion.homePage });
    homePage.setTemplate('homePage', homePageText);

    var label = new html5.Label({ new html5.Label({
        cid: 'label',
        modelValue: 'Hello World!'
    }));

    return homePage;
});
