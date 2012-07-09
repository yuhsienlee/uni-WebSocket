var http = require('http');
var connection = require('./lib/connection.js');

var connectionPool = [];
var ws = http.createServer().listen(9527);

ws.on('connection', function(socket){
  console.log('[OPEN] socket connected...');
});

ws.on('broadcast', function(msg){
  var count = 0;
  for (var ind in connectionPool){
    count++;
  }
  console.log('[BROADCAST] onLine: ' + count);
  connectionPool.forEach(function(connect){
    connect.emit('send', msg);
  });
});

ws.on('onmessage', function(connect, rawData){
  connect.emit('message', rawData);
  var msg = connect.msg
  if (msg){
    ws.emit('broadcast', msg);
  }
});

ws.on('end', function(connect){
  connect.emit('disconnect');
  for (var ind in connectionPool){
    if (connectionPool[ind].sid == connect.sid){
      break;
    }
  }
  delete connectionPool[ind];
  console.log('[END] ' + connect.sid);
});

ws.on('upgrade', function(request, socket, head){
  var connect = new connection(request, socket, head);
  connectionPool.push(connect);
  socket.on('data', function(rawData){
    ws.emit('onmessage', connect, rawData);
  });
  socket.on('close', function(){
    ws.emit('end', connect);
  })
});

console.log('webSocket server running...');
