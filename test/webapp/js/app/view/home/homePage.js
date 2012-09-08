define([
    'jquery',
    'cajetaHtml4',
    'formExampleDiv',
    'text!js/app/view/home/homePage.html'
], function($, Cajeta, formExampleDiv, homePageText) {
    
    // Create an alias for shortening namespace.
    var Html4 = Cajeta.View.Html4;

    var homePage = new Cajeta.View.Page({ componentId: Cajeta.View.homePage });
    homePage.setTemplate('homePage', homePageText);

    var tabs = new Html4.Tabs({ componentId: 'tabs', contentId: 'content' });
    tabs.addChild({ title: 'Html4 Form Example', component: formExampleDiv });
    homePage.addChild(tabs);

    return homePage;
});
