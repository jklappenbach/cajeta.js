define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/formExampleDiv.html'
], function($, Cajeta, formExampleDiv) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.View.Html5;

    var div = new Html5.Div({ id: 'formExampleDiv' });
    div.setTemplate('formExampleDiv', formExampleDiv);

    var form = new Html5.Form({
        id: 'testForm',
        modelPath: 'testForm',
        onSubmit: function() {
            var myData = this.modelAdaptor.getModelData();
            var ds = Cajeta.Datasource.get('dsApp');
            ds.post(myData);
            return false;
        }
    });

    form.addChild(new Html5.Label({
        id: 'firstLabel',
        modelValue: 'Label Text'
    }));

    form.addChild(new Html5.TextInput({
        id: 'firstTextField',
        modelPath: 'testForm.firstTextField',
        attributes: { value: 'First Example Text' }
    }));

    form.addChild(new Html5.TextInput({
        id: 'secondTextField',
        modelPath: 'testForm.secondTextField',
        attributes: { value: 'Second Example Text' }
    }));

    // Add Checkboxes
    form.addChild(new Html5.CheckboxInput({
        id: 'greenColor',
        modelPath: 'testForm.greenColor',
        properties: { checked: 'true' }
    }));

    form.addChild(new Html5.CheckboxInput({
        id: 'blueColor',
        modelPath: 'testForm.blueColor'
    }));

    form.addChild(new Html5.CheckboxInput({
        id: 'redColor',
        modelPath: 'testForm.redColor',
        properties: { checked: 'true' }
    }));

    // Add RadioGroup
    var radioGroup = new Html5.RadioGroup({
        id: 'dietGroup',
        modelPath: 'testForm.diet',
        attributes: { value: 'omnivore' }
    });

    radioGroup.addChild(new Html5.RadioInput({
        id: 'vegetarian',
        properties: { checked: true }
    }));

    radioGroup.addChild(new Html5.RadioInput({ id: 'pescatarian' }));
    radioGroup.addChild(new Html5.RadioInput({ id: 'omnivore' }));

    // TextArea
    form.addChild(new Html5.TextArea({
        id: 'textArea',
        modelPath: 'testForm.description',
        attributes: { cols: 100, rows: 5 },
        properties: { value: 'Enter a description here.' }
    }));

    form.addChild(new Html5.Select({
        id: 'selectStatic',
        modelPath: 'testForm.selectStatic'
    }));

    form.addChild(new Html5.Select({
        id: 'selectProgrammatic',
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
        id: 'selectProgrammaticOption',
        modelPath: 'testForm.selectProgrammaticOption', options: [
            { type: 'optgroup', label: 'First Option', options: [
                { type: 'option', label: 'First Child Option', value: 'firstChildOption'},
                { type: 'option', label: 'Second Child Option', value: 'secondChildOption' }]},
            { type: 'option', label: 'Second Option', value: 'secondOption'},
            { type: 'option', label: 'Third Option', value: 'thirdOption' }
        ]
    }));

    form.addChild(new Html5.Select({
        id: 'selectMultiProgrammatic',
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
