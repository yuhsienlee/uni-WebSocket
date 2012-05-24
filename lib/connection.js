

var connection = function(request, socket, head){
  this._request = request;
  this._socket = socket;
  this._head = head;
  this.webSocketKey = request.headers['sec-websocket-key'];
  this.webSocketVer = request.headers['sec-websocket-version'];
  this.webSocketExt = request.headers['sec-websocket-extensions'];
  
  //handshake
  this.handshake = function(){
    var magicString = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    var crypto = require('crypto').createHash('sha1');
    crypto.update(this.webSocketKey + magicString);
    this.responseHash = crypto.digest('base64');
    console.log('handshake..response key: ' + this.responseHash);
    //
    var response = 'HTTP/1.1 101 Switching Protocols\r\n' +
      'Upgrade: websocket\r\n' +
      'Connection: Upgrade\r\n' +
      'Sec-WebSocket-Accept: ' + this.responseHash + '\r\n' + 
      'Sec-WebSocket-Protocol: chat\r\n\r\n';
    this._socket.write(response, 'ascii');
    console.log('[OPEN] in open state..');
  }
}

module.exports = connection;
