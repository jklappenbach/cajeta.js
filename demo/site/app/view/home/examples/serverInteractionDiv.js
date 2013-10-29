define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/examples/objectModelDiv.html'
], function($, infusion, serverInteractionDiv) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;

    var div = new html5.Div({ cid: 'serverInteraction' });
    div.setTemplate('serverInteractionDiv', serverInteractionDiv);
    return div;
});
