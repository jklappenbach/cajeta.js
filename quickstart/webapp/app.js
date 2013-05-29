requirejs.config({
    baseUrl: '/',
    paths: {
        jquery: 'js/lib/jquery/require-jquery',
        vcdiff: 'js/lib/vcdiff/vcdiff',
        jcookies: 'js/lib/jquery/jquery.cookies.amd',
        cajeta: 'js/lib/cajeta/cajeta',
        cajetaHtml4: 'js/lib/cajeta/cajeta.html4',
        cajetaHtml5: 'js/lib/cajeta/cajeta.html5',
        cajetaSvg: 'js/lib/cajeta/cajeta.html5.svg',
        text: 'js/lib/require/plugin/text',
        order: 'js/lib/require/plugin/order',
        depend: 'js/lib/require/plugin/depend',
        homePage: 'js/app/view/home/homePage',
        accountView: 'js/app/view/account/account',
        formExampleDiv: 'js/app/view/home/formExampleDiv',
        serverInteractionDiv: 'js/app/view/home/serverInteractionDiv'
    }
});

define(['cajetaHtml5', 'homePage'], function(Cajeta, homePage) {
    Cajeta.theApplication = new Cajeta.Application();
    var readEnpoint = Cajeta.Model.AbstractRestEndpointAdaptor.extend({
        urlTemplate: 'http://localhost:8080/api/states/{id}',
        method: 'GET'
    });

    var writeEndpoint = Cajeta.Model.AbstractRestEndpointAdaptor.extend({
        urlTemplate: 'http://localhost:8080/api/states/{id}',
        method: 'POST'
    });

    Cajeta.theApplication.addPage(homePage);
    Cajeta.theApplication.execute();
});