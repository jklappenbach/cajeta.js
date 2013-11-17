define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/examples/examplesDiv.html',
    'examples.formExampleDiv',
], function($, infusion, template, formExampleDiv) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;

    var div = new html5.Div({ cid: 'examplesDiv', template: template });
    var tabs = new html5.TabList({ cid: 'examples', contentId: 'examplesContent' });
    tabs.addChild({ title: 'Html5 Form Example', component: formExampleDiv });
    div.addChild(tabs);

    return div;
});
