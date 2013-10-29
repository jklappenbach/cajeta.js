define([
    'jquery',
    'infusion.html5',
    'text!app/view/home/examples/uiExampleDiv.html'
], function($, infusion, uiExampleDiv) {

    // Create an alias for namespace brevity.
    var html5 = infusion.view.html5;

    var div = new html5.Div({ cid: 'uiExampleDiv' });
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
