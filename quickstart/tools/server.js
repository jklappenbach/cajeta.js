/*
 * node static file server:
 * modified from https://gist.github.com/rpflorence/701407
 */
/*jslint evil: true, nomen: true, sloppy: true */

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    port = process.argv[2] || 8888,
    types = {
        'html': 'text/html',
        'js': 'application/javascript'
    };

var server = http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;
    var filename = path.join(__dirname, '../site', uri);

    console.log(uri + ' -> ' + filename);

    // First, check for our api calls
    // Else, it's for a static file
    fs.exists(filename, function (exists) {
        try {
            if (!exists) {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.write('404 Not Found\n');
                response.end();
                return;
            }

            var type = filename.split('.');
            type = type[type.length - 1];

            response.writeHead(200, { 'Content-Type': types[type] + '; charset=utf-8' });
            fs.createReadStream(filename).pipe(response);
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    });
});

server.listen(parseInt(port, 10));

console.log('Static file server running at\n  => http://localhost:' + port + '/\nCTRL + C to shutdown');
