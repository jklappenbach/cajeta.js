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

var cache = {};

var server = http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;

    console.log('Received request for: ' + uri + ' [' + request.method + ']');

    var data = '';

    // TODO:  Distinguish between GET, PUT, POST and DEL requests
    // First, check for our api calls
    if (uri.indexOf('/unitTest/cacheEntries/') >= 0) {
        if (request.method == 'PUT') {
            request.on('data', function(chunk) {
                console.log("Received body data:");
                console.log(chunk.toString());
                data += chunk.toString();
            });

            request.on('end', function() {
                cache[uri] = data;
                response.writeHead(200, "OK", { 'Content-Type': 'text/html' });
                response.end();
            });
        } else if (request.method == 'GET') {
            response.writeHead(200, "OK", { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(cache[uri]));
        } else {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('404 Not Found\n');
            response.end();
        }
    } else {
        var filename = path.join(__dirname, '../site', uri);
        console.log('File Name: ' + filename);
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
    }
});

server.listen(parseInt(port, 10));

console.log('Static file server running at\n  => http://localhost:' + port + '/\nCTRL + C to shutdown');
