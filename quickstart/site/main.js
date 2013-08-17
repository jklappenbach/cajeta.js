requirejs.config({
    baseUrl: '/',
    paths: {
        'jquery': 'lib/jquery/jquery',
        'vcdiff': 'lib/vcdiff/vcdiff',
        'jcookies': 'lib/jquery/jquery.cookies.amd',
        'cajetaCore': 'lib/cajeta/cajeta.core',
        'cajetaDS': 'lib/cajeta/cajeta.ds',
        'cajetaModel': 'lib/cajeta/cajeta.model',
        'cajetaView': 'lib/cajeta/cajeta.view',
        'cajetaApp': 'lib/cajeta/cajeta.app',
        'cajeta': 'lib/cajeta/cajeta',
        'cajetaHtml4': 'lib/cajeta/cajeta.html4',
        'cajetaHtml5': 'lib/cajeta/cajeta.html5',
        'cajetaSvg': 'lib/cajeta/cajeta.html5.svg',
        'text': 'lib/require/plugin/text',
        'application': 'app/application',
        'homePage': 'app/view/home/homePage',
        'accountView': 'app/view/account/account',
        'formExampleDiv': 'app/view/home/formExampleDiv',
        'uiExampleDiv': 'app/view/home/uiExampleDiv',
        'serverInteractionDiv': 'app/view/home/serverInteractionDiv'
    }
});

define(['application'], function(app) {
    app.execute();
});