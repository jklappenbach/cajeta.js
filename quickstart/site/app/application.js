define(['jquery', 'cajeta', 'homePage'], function($, Cajeta, homePage) {
    Cajeta.theApplication = new Cajeta.Application({
        id: 'demoApplication'
    });

    new Cajeta.Datasource.AjaxDS({
        header: {
            'Accept' : "application/json; charset=UTF-8",
            'Content-Type' : "application/x-www-form-urlencoded; charset=UTF-8"
        },
        encoding: 'application/json',
        uriTemplate: 'http://localhost:8080/application/users/{userId}',
        id: 'dsApp',
        modelPath: 'application.user'
    });

//    var component = new Cajeta.View.Component({
//        componentId: 'test',
//        modelPath: 'testForm.data'
//    });
//
//    var dataGraph = {
//        one: 'one',
//        two: 'two',
//        three: 'three',
//        childOne: {
//            four: 'four',
//            five: 'five',
//            six: 'six'
//        },
//        childTwo: {
//            seven: 'seven',
//            eight: 'eight',
//            nine: 'nine',
//            ten: 'ten'
//        }
//    };
//
//    var subGraph = {
//        eleven: 'eleven',
//        twelve: 'twelve',
//        thirteen: 'thirteen'
//    };
//
//    Cajeta.theApplication.model.set('dataGraph', dataGraph);
//    Cajeta.theApplication.model.set('dataGraph.childOne.subGraph', subGraph);
//    Cajeta.theApplication.model.remove('dataGraph.childOne.subdata');
//    component.setModelValue('modelValue');
//    var result = component.getModelValue()
//
//    var modelValue = Cajeta.theApplication.model.get(component.modelAdaptor.modelPath, component.modelAdaptor.datasourceId);


    Cajeta.theApplication.addPage(homePage);
    return Cajeta.theApplication;
});
