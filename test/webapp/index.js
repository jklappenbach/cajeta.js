requirejs.config({
    baseUrl: '/',
    paths: {
        jquery: 'js/lib/jquery/require-jquery',
        vcdiff: 'js/lib/vcdiff/vcdiff',
        cookies: 'js/lib/jquery/jquery.cookies.2.2.0',
        when: 'js/lib/wire/plugin/when',
        base: 'js/lib/wire/plugin/base',
        wire: 'js/lib/wire/wire',
        cajeta: 'js/lib/cajeta/cajeta',
        text: 'js/lib/require/plugin/text',
        viewLoader: 'js/lib/cajeta/plugin/viewLoader',
        order: 'js/lib/require/plugin/order',
        depend: 'js/lib/require/plugin/depend',
        app: 'js/app/app',
        homePage: 'js/app/view/home/homePage',
        accountView: 'js/app/view/account/account'
    }
});

define(['cajeta', 'homePage'], function(cajeta, homePage) {
    cajeta.theApplication = new cajeta.Application();
    cajeta.theApplication.addPage(homePage);
    cajeta.theApplication.execute();
});