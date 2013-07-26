requirejs.config({
    baseUrl: '/',
    paths: {
        'jquery': 'lib/jquery/jquery',
        'vcdiff': 'lib/vcdiff/vcdiff',
        'jcookies': 'lib/jquery/jquery.cookies.amd',
        'cajeta': 'lib/cajeta/cajeta',
        'cajetaHtml4': 'lib/cajeta/cajeta.html4',
        'cajetaHtml5': 'lib/cajeta/cajeta.html5',
        'cajetaSvg': 'lib/cajeta/cajeta.html5.svg',
        'text': 'lib/require/plugin/text',
        'order': 'lib/require/plugin/order',
        'depend': 'lib/require/plugin/depend',
        'homePage': 'app/view/home/homePage',
        'accountView': 'app/view/account/account',
        'formExampleDiv': 'app/view/home/formExampleDiv',
        'serverInteractionDiv': 'app/view/home/serverInteractionDiv'
    }
//    shim: {
//        'jquery': ['jquery']
//    }
});

define(['cajetaHtml5', 'homePage'], function(Cajeta, homePage) {
    Cajeta.theApplication = new Cajeta.Application();
    // Note:  When this is created, we can still access it globally thought Cajeta.Datasource.map
    new Cajeta.Datasource.RestAjax({
        header: {
            'Accept' : "application/json; charset=UTF-8",
            'Content-Type' : "application/x-www-form-urlencoded; charset=UTF-8"
        },
        encoding: 'application/json',
        uriTemplate: 'http://localhost:8080/application/users/{userId}',
        datasourceId: 'http://localhost:8080/application/users/',
        modelPath: 'application.user'
    });

    Cajeta.theApplication.addPage(homePage);

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
//    Cajeta.theApplication.model.set('dataPath', data);
    Cajeta.theApplication.execute();
});