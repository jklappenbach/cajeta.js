define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/download/downloadDiv.html'
], function($, infusion, template) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;

    var div = new html5.Div({
        cid: 'downloadDiv',
        template: template
    });

    return div;
});
