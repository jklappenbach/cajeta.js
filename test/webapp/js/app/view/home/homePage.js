define([
    'jquery',
    'cajetaHtml4',
    'text!js/app/view/home/homePage.html'
], function($, cajeta, homePageText) {
    var homePage = new cajeta.View.Page(cajeta.View.homePage);
    homePage.setHtml('homePage', homePageText);
    var form = new cajeta.View.Form('testForm');
    var firstNameInput = new cajeta.View.TextInput('firstName', 'testForm.firstName', 'Julian');
    var lastNameInput = new cajeta.View.TextInput('lastName', 'testForm.lastName', 'Bach');
    form.addChild(firstNameInput);
    form.addChild(lastNameInput);
    homePage.addChild(form);
    return homePage;
});
