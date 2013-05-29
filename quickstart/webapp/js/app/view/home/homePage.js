define([
    'jquery',
    'cajetaHtml5',
    'formExampleDiv',
    'serverInteractionDiv',
    'text!js/app/view/home/homePage.html'
], function($, Cajeta, formExampleDiv, serverInteractionDiv, homePageText) {
    
    // Create an alias for shortening namespace.
    var Html5 = Cajeta.View.Html5;

    var homePage = new Cajeta.View.Page({ componentId: Cajeta.View.homePage });
    homePage.setTemplate('homePage', homePageText);

    var tabs = new Html5.TabList({ componentId: 'tabs', contentId: 'content' });
    tabs.addChild({ title: 'Html4 Form Example', component: formExampleDiv });
    tabs.addChild({ title: 'Server Interaction Example', component: serverInteractionDiv });
    homePage.addChild(tabs);

    return homePage;
});
