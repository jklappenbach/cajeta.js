define([
    'jquery',
    'cajetaHtml4',
    'text!js/app/view/home/homePage.html'
], function($, Cajeta, homePageText) {
    var homePage = new Cajeta.View.Page({ componentId: Cajeta.View.homePage });
    homePage.setHtml('homePage', homePageText);
    var form = new Cajeta.View.Form({ componentId: 'testForm',
        onHtmlSubmit: function() {
            alert('Got a submit!');
        }
    });

    var firstNameInput = new Cajeta.View.TextInput({ componentId: 'firstName',
        modelPath: 'testForm.firstName', defaultValue: 'Julian' });
    form.addChild(firstNameInput);
    var lastNameInput = new Cajeta.View.TextInput({ componentId: 'lastName',
        modelPath: 'testForm.lastName', defaultValue: 'Bach' });
    form.addChild(lastNameInput);

    // Add Checkboxes
    form.addChild(new Cajeta.View.CheckboxInput({ componentId: 'greenColor',
        modelPath: 'testForm.greenColor', defaultValue: true }));
    form.addChild(new Cajeta.View.CheckboxInput({ componentId: 'blueColor',
        modelPath: 'testForm.blueColor', defaultValue: false }));
    form.addChild(new Cajeta.View.CheckboxInput({ componentId: 'redColor',
        modelPath: 'testForm.redColor', defaultValue: true }));

    // Add RadioGroup
    var radioGroup = new Cajeta.View.ComponentGroup({ componentId: 'dietGroup',
        modelPath: 'testForm.diet', defaultValue: 'omnivore' });
    radioGroup.addChild(new Cajeta.View.RadioInput({ componentId: 'vegetarian' }));
    radioGroup.addChild(new Cajeta.View.RadioInput({ componentId: 'pescatarian' }));
    radioGroup.addChild(new Cajeta.View.RadioInput({ componentId: 'omnivore' }));

    // TextArea
    form.addChild(new Cajeta.View.TextArea({ componentId: 'textArea',
        modelPath: 'testForm.description', defaultValue: 'Enter a description here.' }));

    form.addChild(new Cajeta.View.Select({ componentId: 'selectStatic',
        modelPath: 'testForm.SelectStatic' }));

    form.addChild(new Cajeta.View.Select({ componentId: 'selectProgrammatic',
        modelPath: 'testForm.selectProgrammatic', options: [
            { elementType: 'option', label: 'First Option', value: 'firstOption' },
            { elementType: 'option', label: 'Second Option', value: 'secondOption'},
            { elementType: 'option', label: 'Third Option', value: 'thirdOption' }],
        onHtmlChange: function() {
            alert('Programmatic Change (wish it was this easy with the world)!');
        }
    }));

    form.addChild(radioGroup);
    homePage.addChild(form);
    return homePage;
});
