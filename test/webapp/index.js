requirejs.config({
    baseUrl: '/',
    paths: {
        jquery: 'js/lib/jquery/require-jquery',
        vcdiff: 'js/lib/vcdiff/vcdiff',
        cookies: 'js/lib/jquery/jquery.cookies.amd',
        cajeta: 'js/lib/cajeta/cajeta',
        cajetaHtml4: 'js/lib/cajeta/cajeta.html4',
        text: 'js/lib/require/plugin/text',
        order: 'js/lib/require/plugin/order',
        depend: 'js/lib/require/plugin/depend',
        homePage: 'js/app/view/home/homePage',
        accountView: 'js/app/view/account/account'
    }
});

define(['cajetaHtml4', 'homePage'], function(cajeta, homePage) {
    cajeta.theApplication = new cajeta.Application();
    cajeta.theApplication.addPage(homePage);
    cajeta.theApplication.execute();
});