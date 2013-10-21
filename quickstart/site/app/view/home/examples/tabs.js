define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/examples/tabs.html',
    'examples.formExampleDiv',
    'examples.serverInteractionDiv',
    'examples.uiExampleDiv'
], function($, infusion, template, formExampleDiv, serverInteractionDiv, uiExampleDiv) {
    
    // Create an alias for shortening namespace.
    var html5 = infusion.view.html5;

    var tabs = new html5.TabList({ cid: 'tabs', contentId: 'content' });
    tabs.addChild({ title: 'Html5 Form Example', component: formExampleDiv });
    tabs.addChild({ title: 'UI Examples', component: uiExampleDiv });
    tabs.addChild({ title: 'Server Interaction Example', component: serverInteractionDiv });

    return tabs;
});
