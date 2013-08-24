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

//    var ds = new Cajeta.Datasource.AjaxDS({
//        id: 'ajaxDS',
//        modelPath: 'unitTest/cacheEntries',
//        uriTemplate: 'http://localhost:8888/unitTest/cacheEntries/{key}',
//        async: false
//    });
//
//    var data = {
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
//    ds.put(data, {
//        key: '00'
//    });

    Cajeta.theApplication.addPage(homePage);
    return Cajeta.theApplication;
});