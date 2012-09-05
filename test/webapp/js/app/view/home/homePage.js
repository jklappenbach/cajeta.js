define([
    'jquery',
    'cajetaHtml4',
    'text!js/app/view/home/homePage.html'
], function($, Cajeta, homePageText) {
    var homePage = new Cajeta.View.Page({ componentId: Cajeta.View.homePage });
    homePage.setHtml('homePage', homePageText);
    var form = new Cajeta.View.Form({ componentId: 'testForm' });
    var firstNameInput = new Cajeta.View.TextInput({ componentId: 'firstName',
        modelPath: 'testForm.firstName', defaultValue: 'Julian' });
    form.addChild(firstNameInput);
    var lastNameInput = new Cajeta.View.TextInput({ componentId: 'lastName',
        modelPath: 'testForm.lastName', defaultValue: 'Bach' });
    form.addChild(lastNameInput);

    var radioGroup = new Cajeta.View.ComponentGroup({ componentId: 'dietGroup',
        modelPath: 'testForm.diet', defaultValue: 'omnivore' });
    radioGroup.addChild(new Cajeta.View.RadioInput({ componentId: 'vegetarian' }));
    radioGroup.addChild(new Cajeta.View.RadioInput({ componentId: 'pescetarian' }));
    radioGroup.addChild(new Cajeta.View.RadioInput({ componentId: 'omnivore' }));
    form.addChild(radioGroup);
    homePage.addChild(form);
    return homePage;
});
