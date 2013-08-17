define(['jquery', 'cajeta', 'homePage'], function($, Cajeta, homePage) {
    Cajeta.theApplication = new Cajeta.Application({
        id: 'demoApplication'
    });

    Cajeta.Datasource.set(new Cajeta.Datasource.AjaxDS({
        header: {
            'Accept' : "application/json; charset=UTF-8",
            'Content-Type' : "application/x-www-form-urlencoded; charset=UTF-8"
        },
        encoding: 'application/json',
        uriTemplate: 'http://localhost:8080/application/users/{userId}',
        id: 'dsApp',
        modelPath: 'application.user.response'
    }));

    var memoryDS = new Cajeta.Datasource.MemoryDS({
        id: 'memDS',
        uriTemplate: 'test/{key}'
    });

    var data = { one: 'one' };

    memoryDS.put(data, {
        key: '00'
    });

    var complete = function(data, requestId) {
        result = data;
    };

    // Asynchronous
    memoryDS.get({
        key: '00',
        async: true,
        onComplete: complete
    });

    Cajeta.theApplication.addPage(homePage);
    return Cajeta.theApplication;
});

/*
 //    var component = new Cajeta.View.Component({
 //        componentId: 'test',
 //        modelPath: 'testForm.data'
 //    });
 //
 var dataGraph = {
 one: 'one',
 two: 'two',
 three: 'three',
 childOne: {
 four: 'four',
 five: 'five',
 six: 'six'
 },
 childTwo: {
 seven: 'seven',
 eight: 'eight',
 nine: 'nine',
 ten: 'ten'
 }
 };
 //
 //    var subGraph = {
 //        eleven: 'eleven',
 //        twelve: 'twelve',
 //        thirteen: 'thirteen'
 //    };
 //
 Cajeta.theApplication.model.set('dataGraph', dataGraph);
 var stateId = Cajeta.theApplication.model.saveState();
 Cajeta.theApplication.model.set('mondo', dataGraph);
 Cajeta.theApplication.model.saveState();
 Cajeta.theApplication.model.loadState(stateId);


 //    Cajeta.theApplication.model.set('dataGraph.childOne.subGraph', subGraph);
 //    Cajeta.theApplication.model.remove('dataGraph.childOne.subdata');
 //    component.setModelValue('modelValue');
 //    var result = component.getModelValue()
 //
 //    var modelValue = Cajeta.theApplication.model.get(component.modelAdaptor.modelPath, component.modelAdaptor.datasourceId);
*/