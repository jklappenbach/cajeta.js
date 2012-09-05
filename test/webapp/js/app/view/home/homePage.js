define([
    'jquery',
    'cajetaHtml4',
    'text!js/app/view/home/homePage.html'
], function($, Cajeta, homePageText) {
    var homePage = new Cajeta.View.Page(Cajeta.View.homePage);
    homePage.setHtml('homePage', homePageText);
    var form = new Cajeta.View.Form('testForm');
    var firstNameInput = new Cajeta.View.TextInput('firstName', 'testForm.firstName', 'Julian');
    form.addChild(firstNameInput);
    var lastNameInput = new Cajeta.View.TextInput('lastName', 'testForm.lastName', 'Bach');
    form.addChild(lastNameInput);

    var radioGroup = new Cajeta.View.ComponentGroup('dietGroup', 'testForm.diet', 'omnivore');
    radioGroup.addChild(new Cajeta.View.RadioInput('vegetarian'));
    radioGroup.addChild(new Cajeta.View.RadioInput('pescetarian'));
    radioGroup.addChild(new Cajeta.View.RadioInput('omnivore'));
    form.addChild(radioGroup);
    homePage.addChild(form);
    return homePage;
});
