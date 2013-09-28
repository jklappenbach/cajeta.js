requirejs.config({
    baseUrl: '/',
    paths: {
        'jquery': 'lib/jquery/jquery',
        'vcdiff': 'lib/vcdiff/vcdiff',
        'jcookies': 'lib/jquery/jquery.cookies.amd',
        'cajeta.core': 'lib/cajeta/cajeta.core',
        'cajeta.ds': 'lib/cajeta/cajeta.ds',
        'cajeta.model': 'lib/cajeta/cajeta.model',
        'cajeta.view': 'lib/cajeta/cajeta.view',
        'cajeta': 'lib/cajeta/cajeta',
        'cajeta.html4': 'lib/cajeta/cajeta.html4',
        'cajeta.html5': 'lib/cajeta/cajeta.html5',
        'cajeta.svg': 'lib/cajeta/cajeta.html5.svg',
        'text': 'lib/require/plugin/text',
        'application': 'app/application',
        'model': 'app/model',
        'ds': 'app/ds',
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