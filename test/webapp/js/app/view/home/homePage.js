define([
    'jquery',
    'cajetaHtml5',
    'text!js/app/view/home/homePage.html'
], function($, Cajeta, homePageText) {
    
    // Create an alias for brief namespace.
    var Html4 = Cajeta.View.Html5;

    var homePage = new Cajeta.View.Page({ componentId: Cajeta.View.homePage });
    homePage.setTemplate('homePage', homePageText);

    return homePage;
});
