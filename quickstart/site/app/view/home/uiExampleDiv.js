define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/uiExampleDiv.html'
], function($, Cajeta, uiExampleDiv) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.View.Html5;

    var div = new Html5.Div({ id: 'uiExampleDiv' });
    div.setTemplate('uiExampleDiv', uiExampleDiv);

    var repeater = new Cajeta.View.Repeater({
        id: 'repeaterExample',
        elementType: 'table',
        modelValue: {
            tableRow: [{ leftColumn: 'first', centerColumn: 'second', rightColumn: 'third '},
                { leftColumn: 'fourth', centerColumn: 'fifth', rightColumn: 'sixth' }]
        },
        content: new Html5.TableRow({
            id: 'tableRow'
        })
    });

    div.addChild(repeater);

    return div;
});
