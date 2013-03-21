var sys = require('sys');
var http = require('http');
var nodeStatic = require('node-static');

var staticServer = new nodeStatic.Server("./webapp");

var server = http.createServer(
    function (req, res) {
        var url = require('url').parse(req.url);

        var pathfile = url.pathname;

        sys.puts('request: ' + pathfile);

        if (pathfile.search('api/') != 0) {
            staticServer.serve(req, res)
        } else {
            res.writeHead(200, { "Content-type": "text/html" });
            res.end('Hello world');
        }
    }
);

server.listen(8080, '127.0.0.1');

sys.puts('Server Listening...');
