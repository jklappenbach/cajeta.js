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
        'infusion.html5': 'lib/infusion/infusion.html5',
        'infusion.resource': 'lib/infusion/infusion.resource',
        'infusion.svg': 'lib/infusion/infusion.html5.svg',
        'infusion': 'lib/infusion/infusion',
        'text': 'lib/require/plugin/text',

        // DI
        'application': 'app/application',
        'model': 'app/model',
        'ds': 'app/ds',
        'l10n': 'app/l10n',

        // Components
        'homePage': 'app/view/home/homePage',
        'about.div': 'app/view/home/about/aboutDiv',
        'api.div': 'app/view/home/api/apiDiv',
        'blog.div': 'app/view/home/blog/blogDiv',
        'community.div': 'app/view/home/community/communityDiv',
        'download.div': 'app/view/home/download/downloadDiv',
        'examples.div': 'app/view/home/examples/examplesDiv',
        'guide.div': 'app/view/home/guide/guideDiv',
        'examples.formExampleDiv': 'app/view/home/examples/formExampleDiv'
    }
});

define(['application', 'homePage'], function(app, homePage) {
    app.addPage(homePage);
    app.execute();
});