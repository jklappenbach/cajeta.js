define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/about/aboutDiv.html'
], function($, infusion, template) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;
    var div = new html5.Div({ cid: 'aboutDiv', template: template });

//    var tabs = new html5.TabList({ cid: 'examples', contentId: 'examplesContent' });
//    tabs.addChild({ title: 'Html5 Form Example', component:  });
//    div.addChild(tabs);
    return div;
});
