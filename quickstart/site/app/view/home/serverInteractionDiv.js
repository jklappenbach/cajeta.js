define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/serverInteractionDiv.html'
], function($, Cajeta, serverInteractionDiv) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.View.Html5;

    var div = new Html5.Div({ cid: 'serverInteraction' });
    div.setTemplate('serverInteractionDiv', serverInteractionDiv);
    return div;
});
