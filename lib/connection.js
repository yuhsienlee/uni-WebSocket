var events = require('events').EventEmitter,
    util = require('util');
var dataFrame = require('./dataFrame.js');

var connection = function(request, socket, head){
  events.call(this);
  var connect = this;
  this.sid = new Date().getTime();
  this._request = request;
  this._socket = socket;
  this._head = head;
  this.webSocketKey = request.headers['sec-websocket-key'];
  this.webSocketVer = request.headers['sec-websocket-version'];
  this.webSocketExt = request.headers['sec-websocket-extensions'];

  this.on('send', function(msg){
    console.log('[SEND] ' + this.sid + ': ' + msg);
    var msgFrame = dataFrame.build(msg);
    this._socket.write(msgFrame);
  });
  
  this.on('message', function(rawData){
    this.msg = dataFrame.parse(rawData);
    console.log('[RECV] ' + this.sid + ': ' + msg);
  });

  this.on('disconnect', function(){
    console.log('[CLOSE] disconnect...');
    this._socket.end();
  });
  
  //handshake
  this.on('handshake', function(){
    var magicString = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    var crypto = require('crypto').createHash('sha1');
    crypto.update(this.webSocketKey + magicString);
    this.responseHash = crypto.digest('base64');
    console.log('[HANDSHAKE] response key: ' + this.responseHash);
    //
    var response = 'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      'Sec-WebSocket-Accept: ' + this.responseHash + '\r\n\r\n';
    this._socket.write(response, 'ascii');
    console.log('[OPEN] switching protocol');
  });
  
  if (this.webSocketVer == '13' && this.webSocketExt == 'x-webkit-deflate-frame'){//webKit
    console.log('[UPGRADE] browser: web-kit');
    this.emit('handshake');
  }
}

util.inherits(connection, events);

module.exports = connection;
