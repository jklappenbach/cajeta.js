define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/uiExampleDiv.html'
], function($, Cajeta, uiExampleDiv) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.view.html5;

    var div = new Html5.Div({ cid: 'uiExampleDiv' });
    div.setTemplate('uiExampleDiv', uiExampleDiv);

 /*
    var repeater = new Cajeta.View.Factory({
        cid: 'repeaterExample',
        elementType: 'table',
        modelValue: {
            tableRow: [{ leftColumn: 'first', centerColumn: 'second', rightColumn: 'third '},
                { leftColumn: 'fourth', centerColumn: 'fifth', rightColumn: 'sixth' }]
        },
        content: new Html5.TableRow({
            tid: 'tableRow'
        })
    });

    div.addChild(repeater);
*/
    return div;
});
