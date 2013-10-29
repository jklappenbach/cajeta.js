define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/examples/examplesDiv.html',
    'examples.formExampleDiv',
    'examples.uiExampleDiv',
    'examples.serverInteractionDiv'
], function($, infusion, template, formExampleDiv, uiExampleDiv, serverInteractionDiv) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;

    var div = new html5.Div({ cid: 'examplesDiv', template: template });
    var tabs = new html5.TabList({ cid: 'examples', contentId: 'examples-content' });
    tabs.addChild({ title: 'Html5 Form Example', component: formExampleDiv });
    tabs.addChild({ title: 'UI Examples', component: uiExampleDiv });
    tabs.addChild({ title: 'Server Interaction Example', component: serverInteractionDiv });
    div.addChild(tabs);

    return div;
});
