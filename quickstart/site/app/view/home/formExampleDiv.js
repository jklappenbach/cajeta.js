define([
    'jquery',
    'cajeta.html5',
    'text!app/view/home/formExampleDiv.html',
    'model'
], function($, cajeta, formExampleDiv, model) {

    // Create an alias for namespace brevity.
    var html5 = cajeta.view.html5;

    var div = new html5.Div({ cid: 'formExampleDiv' });
    div.setTemplate('formExampleDiv', formExampleDiv);

    var form = new cajeta.view.Form({
        cid: 'testForm',
        modelPath: 'testForm',
        onSubmit: function() {
            var myData = model.getByComponent(this);
//            var ds = cajeta.Datasource.get('dsApp');
//            ds.post(myData);
            return false;
        }
    });

    form.addChild(new html5.Label({
        cid: 'firstLabel',
        modelValue: 'My Label Text'
    }));

    form.addChild(new html5.TextInput({
        cid: 'firstTextField',
        modelValue: 'First Example Text'
    }));

    form.addChild(new html5.TextInput({
        cid: 'secondTextField',
        modelValue: 'Second Example Text'
    }));

    // Add Checkboxes
    form.addChild(new html5.CheckboxInput({
        cid: 'greenColor',
        modelValue: 'true'
    }));

    form.addChild(new html5.CheckboxInput({
        cid: 'blueColor'
    }));

    form.addChild(new html5.CheckboxInput({
        cid: 'redColor',
        modelValue: 'true'
    }));

    // Add RadioGroup
    var radioGroup = new html5.RadioGroup({
        cid: 'dietGroup',
        modelValue: 'omnivore'
    });

    radioGroup.addChild(new html5.RadioInput({ cid: 'vegetarian', properties: { checked: true } }));
    radioGroup.addChild(new html5.RadioInput({ cid: 'pescatarian' }));
    radioGroup.addChild(new html5.RadioInput({ cid: 'omnivore' }));

    // TextArea, example of how to have a default value that doesn't get committed
    form.addChild(new html5.TextArea({
        cid: 'textArea',
        modelPath: 'testForm.description',
        attributes: { cols: 100, rows: 5 },
        promptValue: 'Enter a description here'
    }));

    form.addChild(new html5.Select({
        cid: 'selectStatic'
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamic',
        factory: new cajeta.view.Factory({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamic',
            modelPath: 'ui.selectDynamic'
        }),
        modelValue: 1
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamicGroup',
        factory: new cajeta.view.Factory({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamicGroup',
            modelPath: 'ui.selectDynamicGroup'
        }),
        modelValue: 2
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamicMulti',
        factory: new cajeta.view.Factory({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamicMulti',
            modelPath: 'ui.selectDynamicMulti'
        })
    }));

    form.addChild(new html5.Select({
        cid: 'selectDynamicAlt',
        factory: new cajeta.view.Factory({
            dsid: 'formExampleDS',
            uri: '/formExample/selectDynamicAlt',
            modelPath: 'ui.selectDynamicAlt',
            templates: {
                optgroup: new cajeta.view.Component({
                    elementType: 'optgroup',
                    tid: 'optgroup',
                    modelEncoding: 'attr:value'
                }),
                option: new cajeta.view.Component({
                    elementType: 'option',
                    tid: 'option',
                    modelEncoding: 'attr:value'
                })
            }
        })
    }));

    form.addChild(radioGroup);

    form.addChild(new html5.Button({
        cid: 'submitButton',
        onHtmlClick: function() {
            form.onSubmit();
        }
    }));
    div.addChild(form);
    return div;
});
