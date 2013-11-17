define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/guide/guideDiv.html'
], function($, infusion, template) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;

    var div = new html5.Div({
        cid: 'guideDiv',
        template: template
    });

    return div;
});
