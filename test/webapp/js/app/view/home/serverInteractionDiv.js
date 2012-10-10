define([
    'jquery',
    'cajetaHtml4',
    'text!js/app/view/home/serverInteractionDiv.html'
], function($, Cajeta, serverInteractionDiv) {

    // Create an alias for namespace brevity.
    var Html4 = Cajeta.View.Html4;

    var div = new Html4.Div({ componentId: 'serverInteraction' });
    div.setTemplate('serverInteractionDiv', serverInteractionDiv);
    return div;
});
