var serverPort = 9867;

// dependencies
var webSocketServer = require('websocket').server;
var http = require('http');
var players = {};
var nextPlayerId = 0;

// create http server
var server = http.createServer(function(request, response) { });
server.listen(serverPort, function() {
    console.log((new Date()) + " Server is listening on port " + serverPort);
});

// create websocket server
var wServer = new webSocketServer({ httpServer: server });
// connection request callback
wServer.on('request', function(request) {
    var connection = request.accept(null, request.origin); 
    connection.binaryType = "arraybuffer";
    var player = {};
    player.connection = connection;
    player.id = nextPlayerId;
    nextPlayerId++;
    players[player.id] = player;
    console.log((new Date()) + ' connect: ' + player.id);

    // message received callback
    connection.on('message', function(message) {
        if (message.type == 'binary' && 'binaryData' in message && message.binaryData instanceof Buffer) {
            // this works! 
            console.log('received:');
            console.log(message);   

        }
    });

    // connection closed callback
    connection.on('close', function(connection) {
        console.log((new Date()) + ' disconnect: ' + player.id);
        delete players[player.id];
    });
});

function loop() {
    var byteArray = new Uint8Array(2);
    byteArray[0] = 1;
    byteArray[0] = 2;
    for (var index in players) {
        var player = players[index];
        console.log('sending: ');
        console.log(byteArray.buffer);
        player.connection.send(byteArray.buffer);
    }
}

timerId = setInterval(loop, 500);   

