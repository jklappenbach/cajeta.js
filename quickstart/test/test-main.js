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
    baseUrl: '/base/webapp',

    paths: {
        'jquery': 'lib/jquery/jquery',
        'vcdiff': 'lib/vcdiff/vcdiff',
        'jcookies': 'lib/jquery/jquery.cookies.amd',
        'cajeta': 'lib/cajeta/cajeta',
        'cajetaHtml4': 'lib/cajeta/cajeta.html4',
        'cajetaHtml5': 'lib/cajeta/cajeta.html5',
        'cajetaSvg': 'lib/cajeta/cajeta.html5.svg',
        'text': 'lib/require/plugin/text',
        'order': 'lib/require/plugin/order',
        'depend': 'lib/require/plugin/depend'
    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});
