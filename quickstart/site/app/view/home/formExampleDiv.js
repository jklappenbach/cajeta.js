define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/formExampleDiv.html'
], function($, Cajeta, formExampleDiv) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.View.Html5;

    var div = new Html5.Div({ componentId: 'formExampleDiv' });
    div.setTemplate('formExampleDiv', formExampleDiv);

    var form = new Html5.Form({
        componentId: 'testForm',
        onHtmlSubmit: function() {
            var myData = Cajeta.theApplication.getModel().getNode('local', 'testForm');
            var ds = Cajeta.Datasource.map['http://localhost:8080/application/users/'];
            ds.post(myData);
            return false;
        }
    });

    form.addChild(new Html5.Label({
        componentId: 'firstLabel',
        attributes: { value: 'Label Text' }
    }));

    form.addChild(new Html5.TextInput({
        componentId: 'firstTextField',
        modelPath: 'testForm.firstTextField',
        attributes: { value: 'First Example Text' }
    }));

    form.addChild(new Html5.TextInput({
        componentId: 'secondTextField',
        modelPath: 'testForm.secondTextField',
        attributes: { value: 'Second Example Text' }
    }));

    // Add Checkboxes
    form.addChild(new Html5.CheckboxInput({
        componentId: 'greenColor',
        modelPath: 'testForm.greenColor',
        properties: { checked: 'true' }
    }));

    form.addChild(new Html5.CheckboxInput({
        componentId: 'blueColor',
        modelPath: 'testForm.blueColor'
    }));

    form.addChild(new Html5.CheckboxInput({
        componentId: 'redColor',
        modelPath: 'testForm.redColor',
        properties: { checked: 'true' }
    }));

    // Add RadioGroup
    var radioGroup = new Html5.RadioGroup({
        componentId: 'dietGroup',
        modelPath: 'testForm.diet',
        attributes: { value: 'omnivore' }
    });

    radioGroup.addChild(new Html5.RadioInput({
        componentId: 'vegetarian',
        properties: { checked: true }
    }));

    radioGroup.addChild(new Html5.RadioInput({ componentId: 'pescatarian' }));
    radioGroup.addChild(new Html5.RadioInput({ componentId: 'omnivore' }));

    // TextArea
    form.addChild(new Html5.TextArea({
        componentId: 'textArea',
        modelPath: 'testForm.description',
        attributes: { cols: 100, rows: 5 },
        properties: { value: 'Enter a description here.' }
    }));

    form.addChild(new Html5.Select({
        componentId: 'selectStatic',
        modelPath: 'testForm.selectStatic'
    }));

    form.addChild(new Html5.Select({
        componentId: 'selectProgrammatic',
        modelPath: 'testForm.selectProgrammatic',
        options: [
            { type: 'option', label: 'First Option', value: 'firstOption' },
            { type: 'option', label: 'Second Option', value: 'secondOption'},
            { type: 'option', label: 'Third Option', value: 'thirdOption' }
        ],
        onHtmlChange: function(event) {
            alert('Programmatic is changed.');
        }
    }));

    form.addChild(new Html5.Select({
        componentId: 'selectProgrammaticOption',
        modelPath: 'testForm.selectProgrammaticOption', options: [
            { type: 'optgroup', label: 'First Option', options: [
                { type: 'option', label: 'First Child Option', value: 'firstChildOption'},
                { type: 'option', label: 'Second Child Option', value: 'secondChildOption' }]},
            { type: 'option', label: 'Second Option', value: 'secondOption'},
            { type: 'option', label: 'Third Option', value: 'thirdOption' }
        ]
    }));

    form.addChild(new Html5.Select({
        componentId: 'selectMultiProgrammatic',
        modelPath: 'testForm.selectMultiProgrammatic',
        options: [
            { type: 'option', label: 'First Multi Option', value: 'firstMultiOption' },
            { type: 'option', label: 'Second Multi Option', value: 'secondMultiOption' },
            { type: 'option', label: 'Third Multi Option', value: 'thirdMultiOption' }
        ]
    }));

    form.addChild(radioGroup);
    div.addChild(form);
    return div;
});
