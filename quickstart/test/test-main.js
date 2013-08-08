var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (/Spec\.js$/.test(file)) {
      tests.push(file);
    }
  }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',

    paths: {
        'jquery': 'lib/jquery/jquery',
        'vcdiff': 'lib/vcdiff/vcdiff',
        'jcookies': 'lib/jquery/jquery.cookies.amd',
        'cajetaClass': 'lib/cajeta/cajeta.class',
        'cajetaDS': 'lib/cajeta/cajeta.ds',
        'cajetaModel': 'lib/cajeta/cajeta.model',
        'cajetaView': 'lib/cajeta/cajeta.view',
        'cajeta': 'lib/cajeta/cajeta',
        'cajetaHtml4': 'lib/cajeta/cajeta.html4',
        'cajetaHtml5': 'lib/cajeta/cajeta.html5',
        'cajetaSvg': 'lib/cajeta/cajeta.html5.svg',
        'text': 'lib/require/plugin/text',
        'application': 'app/application',
        'homePage': 'app/view/home/homePage',
        'accountView': 'app/view/account/account',
        'formExampleDiv': 'app/view/home/formExampleDiv',
        'serverInteractionDiv': 'app/view/home/serverInteractionDiv'
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
