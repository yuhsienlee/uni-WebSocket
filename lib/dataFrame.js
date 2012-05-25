

var dataFrame = function(){
}

dataFrame.prototype.build = function(msg){
  var headData = [];
  var fin = 1;
  var rsv1 = 0;
  var rsv2 = 0;
  var rsv3 = 0;
  var opCode = 1;
  var isMask = 0;
  var length = 0;
  var msgBuffer = new Buffer(msg, 'utf8');
  var tmpByte = (((fin << 3) + (rsv1 << 2) + (rsv2 << 1) + rsv3) << 4) + opCode;
  headData.push(tmpByte);

  if (msgBuffer.length < 126){
    length = msgBuffer.length;
    tmpByte = (isMask << 7) + length; 
    headData.push(tmpByte);
  }else if (msgBuffer.length > 126 && msgBuffer.length <= 0xffff){
    legnth = 0x7e;
  }else if (msgBuffer.length > 0xffff){
    legnth = 0x7f;
  }
  var headerFrame = new Buffer(headData);
  rawData = new Buffer(msgBuffer.length + headerFrame.length);
  var rawDataPos = 0;
  headerFrame.copy(rawData, rawDataPos);
  rawDataPos+= headerFrame.length;
  msgBuffer.copy(rawData, rawDataPos);
  return rawData;
}

dataFrame.prototype.parse = function(data){
  var fin = Boolean(data[0] & 0x80);
  var rsv1 = Boolean(data[0] & 0x40);
  var rsv2 = Boolean(data[0] & 0x20);
  var rsv3 = Boolean(data[0] & 0x10);
  var isMask = Boolean(data[1] & 0x80);
  var opCode = data[0] & 0x0f;
  var length = data[1] & 0x7f;
  var mask;
  if (fin){
    var decodeFrame = [];
    var encodeFrame = [];
    switch (length){
      case 126:
        mask = data.slice(4, 8);
        dataLength = data.slice(2, 4).readUInt16BE(0);
        var dataStart = 8;
        break;
      case 127:
        mask = data.slice(6, 10);
        dataLength = data.slice(2, 6).readUInt16BE(0);
        var dataStart = 10;
        break;
      default:
        mask = data.slice(2, 6);
        dataLength = length;
        var dataStart = 6;
        break;
    }
    for (var i = dataStart; i < data.length; i++){
      encodeFrame.push(data[i]);
    }
    var maskPos = 0;
    for (var dataPos = 0; dataPos < encodeFrame.length; dataPos++){
      decodeFrame.push(encodeFrame[dataPos] ^ mask[maskPos]);
      maskPos = maskPos == 3 ? 0 : maskPos + 1;
    }
    msgBuffer = new Buffer(decodeFrame);
    msg = msgBuffer.toString('utf8', 0, dataLength);
  }
  return msg;
}

var frame = new dataFrame;

module.exports = frame;
