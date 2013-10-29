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
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
