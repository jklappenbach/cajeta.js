requirejs.config({
    baseUrl: '/',
    paths: {
        // library files
        'jquery': 'lib/jquery/jquery',
        'vcdiff': 'lib/vcdiff/vcdiff',
        'jcookies': 'lib/jquery/jquery.cookies.amd',
        'infusion.core': 'lib/infusion/infusion.core',
        'infusion.ds': 'lib/infusion/infusion.ds',
        'infusion.model': 'lib/infusion/infusion.model',
        'infusion.view': 'lib/infusion/infusion.view',
        'infusion.resource': 'lib/infusion/infusion.resource',
        'infusion': 'lib/infusion/infusion',
        'infusion.html4': 'lib/infusion/infusion.html4',
        'infusion.html5': 'lib/infusion/infusion.html5',
        'infusion.svg': 'lib/infusion/infusion.html5.svg',
        'text': 'lib/require/plugin/text',
        'component': 'lib/infusion/plugin/component',

        // DI
        'application': 'app/application',
        'model': 'app/model',
        'ds': 'app/ds',
        'l10n': 'app/l10n'
    }
});

define('main', ['application', 'component!app/view/home/homePage'], function(app, homePage) {
    app.addPage(homePage);
    app.execute();
});

