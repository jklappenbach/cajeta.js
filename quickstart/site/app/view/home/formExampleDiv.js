define([
    'jquery',
    'cajetaHtml5',
    'text!app/view/home/formExampleDiv.html',
    'model'
], function($, Cajeta, formExampleDiv, model) {

    // Create an alias for namespace brevity.
    var Html5 = Cajeta.View.Html5;

    var div = new Html5.Div({ cid: 'formExampleDiv' });
    div.setTemplate('formExampleDiv', formExampleDiv);

    var form = new Cajeta.View.Form({
        cid: 'testForm',
        modelPath: 'testForm',
        onSubmit: function() {
            var myData = model.getByComponent(this);
//            var ds = Cajeta.Datasource.get('dsApp');
//            ds.post(myData);
            return false;
        }
    });

    form.addChild(new Html5.Label({
        cid: 'firstLabel',
        modelValue: 'My Label Text'
    }));

    form.addChild(new Html5.TextInput({
        cid: 'firstTextField',
        modelValue: 'First Example Text'
    }));

    form.addChild(new Html5.TextInput({
        cid: 'secondTextField',
        modelValue: 'Second Example Text'
    }));

    // Add Checkboxes
    form.addChild(new Html5.CheckboxInput({
        cid: 'greenColor',
        modelValue: 'true'
    }));

    form.addChild(new Html5.CheckboxInput({
        cid: 'blueColor'
    }));

    form.addChild(new Html5.CheckboxInput({
        cid: 'redColor',
        modelValue: 'true'
    }));

    // Add RadioGroup
    var radioGroup = new Html5.RadioGroup({
        cid: 'dietGroup',
        modelValue: 'omnivore'
    });

    radioGroup.addChild(new Html5.RadioInput({ cid: 'vegetarian', properties: { checked: true } }));
    radioGroup.addChild(new Html5.RadioInput({ cid: 'pescatarian' }));
    radioGroup.addChild(new Html5.RadioInput({ cid: 'omnivore' }));

    // TextArea, example of how to have a default value that doesn't get committed
    form.addChild(new Html5.TextArea({
        cid: 'textArea',
        modelPath: 'testForm.description',
        attributes: { cols: 100, rows: 5 },
        promptValue: 'Enter a description here'
    }));

    // TODO Decide how best to handle the situation where we need to populate both the displayed set of options, as well
    // TODO as the selection state, in the model.  They can't both be modelValue.
    form.addChild(new Html5.Select({
        cid: 'selectStatic'
    }));

    form.addChild(new Html5.Select({
        cid: 'selectProgrammatic',
        modelValue: [
            { type: 'option', label: 'First Option', value: 'firstOption' },
            { type: 'option', label: 'Second Option', value: 'secondOption'},
            { type: 'option', label: 'Third Option', value: 'thirdOption' }
        ]
    }));

    form.addChild(new Html5.Select({
        cid: 'selectProgrammaticOption',
        modelValue: [
            { type: 'optgroup', label: 'First Option', options: [
                { type: 'option', label: 'First Child Option', value: 'firstChildOption'},
                { type: 'option', label: 'Second Child Option', value: 'secondChildOption' }]},
            { type: 'option', label: 'Second Option', value: 'secondOption'},
            { type: 'option', label: 'Third Option', value: 'thirdOption' }
        ]
    }));

    form.addChild(new Html5.Select({
        cid: 'selectMultiProgrammatic',
        modelValue: [
            { type: 'option', label: 'First Multi Option', value: 'firstMultiOption' },
            { type: 'option', label: 'Second Multi Option', value: 'secondMultiOption' },
            { type: 'option', label: 'Third Multi Option', value: 'thirdMultiOption' }
        ]
    }));

    form.addChild(radioGroup);

    form.addChild(new Html5.Button({
        cid: 'submitButton',
        onHtmlClick: function() {
            form.onSubmit();
        }
    }));
    div.addChild(form);
    return div;
});
