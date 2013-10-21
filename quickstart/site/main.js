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
        'infusion': 'lib/infusion/infusion',
        'infusion.html4': 'lib/infusion/infusion.html4',
        'infusion.html5': 'lib/infusion/infusion.html5',
        'infusion.svg': 'lib/infusion/infusion.html5.svg',
        'text': 'lib/require/plugin/text',

        // DI
        'application': 'app/application',
        'model': 'app/model',
        'ds': 'app/ds',
        'strings': 'app/strings.en.us',

        // Components
        'homePage': 'app/view/home/homePage',
        'about.tabs': 'app/view/home/about/tabs',
        'api.tabs': 'app/view/home/api/tabs',
        'blog.tabs': 'app/view/home/blog/tabs',
        'community.tabs': 'app/view/home/community/tabs',
        'download.tabs': 'app/view/home/download/tabs',
        'examples.tabs': 'app/view/home/examples/tabs',
        'guide.tabs': 'app/view/home/guide/tabs',
        'examples.formExampleDiv': 'app/view/home/examples/formExampleDiv',
        'examples.uiExampleDiv': 'app/view/home/examples/uiExampleDiv',
        'examples.serverInteractionDiv': 'app/view/home/examples/serverInteractionDiv'
    }
});

define(['application'], function(app) {
    app.execute();
});