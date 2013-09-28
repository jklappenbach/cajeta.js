define([
    'jquery',
    'cajeta.html5',
    'text!app/view/home/serverInteractionDiv.html'
], function($, cajeta, serverInteractionDiv) {

    // Create an alias for namespace brevity.
    var html5 = cajeta.view.html5;

    var div = new html5.Div({ cid: 'serverInteraction' });
    div.setTemplate('serverInteractionDiv', serverInteractionDiv);
    return div;
});
