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
        //'app': 'app/app',
        'homePage': 'app/view/home/homePage',
        'accountView': 'app/view/account/account',
        'formExampleDiv': 'app/view/home/formExampleDiv',
        'serverInteractionDiv': 'app/view/home/serverInteractionDiv'
    }
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
//    var subdata = {
//        eleven: 'eleven',
//        twelve: 'twelve',
//        thirteen: 'thirteen'
//    };
//
//    var component = new Cajeta.View.Component({
//        componentId: 'test',
//        modelPath: 'testData.childTwo.ten',
//        modelChanged: false,
//        onModelChanged: function() {
//            this.modelChanged = true;
//        }
//    });
//
//
//    Cajeta.theApplication.model.bindComponent(component);
//    Cajeta.theApplication.model.set('testData', data);
//    Cajeta.theApplication.model.releaseComponent(component);
//    Cajeta.theApplication.model.saveState();
//    Cajeta.theApplication.model.set('testData.childOne.subdata', subdata);
//    Cajeta.theApplication.model.saveState();
//    Cajeta.theApplication.model.set('testData.childTwo.subdata', subdata);
//    Cajeta.theApplication.model.saveState();
//
//    Cajeta.theApplication.model.loadState(0);

    Cajeta.theApplication.execute();
});