define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/formExampleDiv.html',
    'model'
], function($, Cajeta, formExampleDiv, model) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.View.Html5;

    var div = new Html5.Div({ id: 'formExampleDiv' });
    div.setTemplate('formExampleDiv', formExampleDiv);

    var form = new Cajeta.View.Form({
        id: 'testForm',
        modelPath: 'testForm',
        onSubmit: function() {
            var myData = model.getByComponent(this);
//            var ds = Cajeta.Datasource.get('dsApp');
//            ds.post(myData);
            return false;
        }
    });

    form.addChild(new Html5.Label({
        id: 'firstLabel',
        modelValue: 'My Label Text'
    }));

    form.addChild(new Html5.TextInput({
        id: 'firstTextField',
        modelValue: 'First Example Text'
    }));

    form.addChild(new Html5.TextInput({
        id: 'secondTextField',
        modelValue: 'Second Example Text'
    }));

    // Add Checkboxes
    form.addChild(new Html5.CheckboxInput({
        id: 'greenColor',
        modelValue: 'true'
    }));

    form.addChild(new Html5.CheckboxInput({
        id: 'blueColor'
    }));

    form.addChild(new Html5.CheckboxInput({
        id: 'redColor',
        modelValue: 'true'
    }));

    // Add RadioGroup
    var radioGroup = new Html5.RadioGroup({
        id: 'dietGroup',
        modelValue: 'omnivore'
    });

    radioGroup.addChild(new Html5.RadioInput({ id: 'vegetarian', properties: { checked: true } }));
    radioGroup.addChild(new Html5.RadioInput({ id: 'pescatarian' }));
    radioGroup.addChild(new Html5.RadioInput({ id: 'omnivore' }));

    // TextArea, example of how to have a default value that doesn't get committed
    form.addChild(new Html5.TextArea({
        id: 'textArea',
        modelPath: 'testForm.description',
        attributes: { cols: 100, rows: 5 },
        promptValue: 'Enter a description here'
    }));

    form.addChild(new Html5.Select({
        id: 'selectStatic'
    }));

    form.addChild(new Html5.Select({
        id: 'selectProgrammatic',
        options: [
            { type: 'option', label: 'First Option', value: 'firstOption' },
            { type: 'option', label: 'Second Option', value: 'secondOption'},
            { type: 'option', label: 'Third Option', value: 'thirdOption' }
        ]
    }));

    form.addChild(new Html5.Select({
        id: 'selectProgrammaticOption',
        options: [
            { type: 'optgroup', label: 'First Option', options: [
                { type: 'option', label: 'First Child Option', value: 'firstChildOption'},
                { type: 'option', label: 'Second Child Option', value: 'secondChildOption' }]},
            { type: 'option', label: 'Second Option', value: 'secondOption'},
            { type: 'option', label: 'Third Option', value: 'thirdOption' }
        ]
    }));

    form.addChild(new Html5.Select({
        id: 'selectMultiProgrammatic',
        options: [
            { type: 'option', label: 'First Multi Option', value: 'firstMultiOption' },
            { type: 'option', label: 'Second Multi Option', value: 'secondMultiOption' },
            { type: 'option', label: 'Third Multi Option', value: 'thirdMultiOption' }
        ]
    }));

    form.addChild(radioGroup);

    form.addChild(new Html5.Button({
        id: 'submitButton',
        onHtmlClick: function() {
            form.onSubmit();
        }
    }));
    div.addChild(form);
    return div;
});
