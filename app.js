const http = require('http');
const WebSocketServer = require('websocket').server;
const server = http.createServer();
server.listen(9898);
const wsServer = new WebSocketServer({
    httpServer: server
});
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    connection.on('message', function() {
      connection.sendUTF('start'); // 1
      setTimeout(function callback() {
        connection.sendUTF('message from callback'); // 6 the in queue set timeout with 0 miliseconds
      });
      connection.sendUTF('message'); // 2
      setTimeout(function callback_1() {
        connection.sendUTF('setTimeout after 0 miliseconds'); // 7
      }, 0);
  
      Promise.resolve()
        .then(() => connection.sendUTF("promise done!")) // 4 then in queue we have microtasks
        .then(() => connection.sendUTF("second promise done!")); // 5
  
      setTimeout(function() {
        setTimeout(function() {
          connection.sendUTF('setTimeout after 10 miliseconds') // 9
        }, 0);
        setImmediate(function() {
          connection.sendUTF('setImmediate after 10 miliseconds') // 8 when we have > 0 miliseconds in setTimeout in call back function setImmidiate runs before another setTimout
        });
      }, 10);

      connection.sendUTF('finish'); // 3
    });

    connection.on('close', function(reasonCode, description) {
        console.log('Client has disconnected.');
    });
});