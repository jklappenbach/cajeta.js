define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/uiExampleDiv.html'
], function($, Cajeta, uiExampleDiv) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.View.Html5;

    var div = new Html5.Div({ id: 'uiExampleDiv' });
    div.setTemplate('uiExampleDiv', uiExampleDiv);
    return div;
});
