define([
    'jquery',
    'cajetaHtml4',
    'formExampleDiv',
    'serverInteractionDiv',
    'text!js/app/view/home/homePage.html'
], function($, Cajeta, formExampleDiv, serverInteractionDiv, homePageText) {
    
    // Create an alias for shortening namespace.
    var Html4 = Cajeta.View.Html4;

    var homePage = new Cajeta.View.Page({ componentId: Cajeta.View.homePage });
    homePage.setTemplate('homePage', homePageText);

    var tabs = new Html4.TabList({ componentId: 'tabs', contentId: 'content' });
    tabs.addChild({ title: 'Html4 Form Example', component: formExampleDiv });
    tabs.addChild({ title: 'Server Interaction Example', component: serverInteractionDiv });
    homePage.addChild(tabs);

    return homePage;
});
