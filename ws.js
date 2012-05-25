var http = require('http');
var connection = require('./lib/connection.js');

var connectionPool = [];
var ws = http.createServer().listen(9527);

ws.on('connection', function(socket){
  console.log('[OPEN] socket connected...');
});

ws.on('broadcast', function(msg){
  console.log('[BROADCAST]');
  connectionPool.forEach(function(connect){
    connect.emit('send', msg);
  });
});

ws.on('onmessage', function(connect, rawData){
  connect.emit('message', rawData);
  var msg = connect.msg
  ws.emit('broadcast', msg);
});

ws.on('end', function(sid){
  console.log('[END] ' + sid);
});

ws.on('upgrade', function(request, socket, head){
  var connect = new connection(request, socket, head);
  connectionPool.push(connect);
  socket.on('data', function(rawData){
    ws.emit('onmessage', connect, rawData);
  });
  socket.on('close', function(){
    ws.emit('end', connect.sid);
  })
});

console.log('webSocket server running...');
