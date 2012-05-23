var http = require('http');

var connection = require('./lib/connection.js'),
    dataFrameObject = require('./lib/dataFrame.js');

http.createServer(function(req, res){

})
.on('connection', function(socket){
  console.log('[OPEN] socket connected...');
})
.on('upgrade', function(request, socket, head){

  var connect = new connection(request, socket, head);
  if (connect.webSocketVer == '13' && connect.webSocketExt == 'x-webkit-deflate-frame'){//webKit
    console.log('[UPGRADE] browser: web-kit');
    connect.handshake();
  }
  //接收
  socket.on('data',function(rawData){
    console.log(rawData);
    var dataFrame = new dataFrameObject();
    console.log(dataFrame.parseFrame(rawData));
  });
})
.listen(9527);

console.log('webSocket server running...');





