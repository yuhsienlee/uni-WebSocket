
const DECODE = 0;
const ENCODE = 1;

var dataFrame = function(){
  this.mask = null;
  this.error = false;
  this.frameType = DECODE;
}

dataFrame.prototype.makeFrame = function(msg){
  this.msg = msg;
  var headData = [];
  var tmpByte;
  this.fin = 1;
  this.rsv1 = 0;
  this.rsv2 = 0;
  this.rsv3 = 0;
  this.opCode = 1;
  tmpByte = (((this.fin << 3) + (this.rsv1 << 2) + (this.rsv2 << 1) + this.rsv3) << 4) + this.opCode;
  headData.push(tmpByte);
  this.isMask = 0;
  this.msgBuffer = new Buffer(msg, 'utf8');
  if (msgBuffer.length < 126){
    this.length = msgBuffer.length;
    tmpByte = (this.isMask << 7) + this.length; 
    headData.push(tmpByte);
  }else if (this.msgBuffer.length > 126 && this.msgBuffer.length <= 0xffff){
    this.legnth = 0x7e;
  }else if (this.msgBuffer.length > 0xffff){
    this.legnth = 0x7f;
  }
  var headerFrame = new Buffer(headData);
  this.rawData = new Buffer(this.msgBuffer.length + headerFrame.length);
  var rawDataPos = 0;
  headerFrame.copy(this.rawData, rawDataPos);
  rawDataPos+= headerFrame.length;
  this.msgBuffer.copy(this.rawData, rawDataPos);
  return this
}

dataFrame.prototype.parseFrame = function(data){
  this.rawData = data;
  this.fin = Boolean(data[0] & 0x80);
  this.rsv1 = Boolean(data[0] & 0x40);
  this.rsv2 = Boolean(data[0] & 0x20);
  this.rsv3 = Boolean(data[0] & 0x10);
  this.isMask = Boolean(data[1] & 0x80);
  this.opCode = data[0] & 0x0f;
  this.length = data[1] & 0x7f;

  if (!this.fin){
    this.error = true;
  }else{
    this.frameType = ENCODE;
    var encodeFrame = [];
    var decodeFrame = [];
    switch (this.length){
      case 126:
        this.mask = data.slice(4, 8);
        this.dataLength = data.slice(2, 4).readUInt16BE(0);
        var dataStart = 8;
        break;
      case 127:
        this.mask = new data.slice(6, 10);
        this.dataLength = data.slice(2, 6).readUInt16BE(0);
        var dataStart = 10;
        break;
      default:
        this.mask = data.slice(2, 6);
        this.dataLength = this.length;
        var dataStart = 6;
        break;
    }
    for (var i = dataStart; i < data.length; i++){
      encodeFrame.push(data[i]);
    }
    var maskPos = 0;
    for (var dataPos = 0; dataPos < encodeFrame.length; dataPos++){
      decodeFrame.push(encodeFrame[dataPos] ^ this.mask[maskPos]);
      maskPos = maskPos == 3 ? 0 : maskPos + 1;
    }
    this.msgBuffer = new Buffer(decodeFrame);
    this.msg = this.msgBuffer.toString('utf8', 0, this.dataLength);
  }
  return this;
}
module.exports = dataFrame;
