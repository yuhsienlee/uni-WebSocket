
const DECODE = 0;
const ENCODE = 1;

var dataFrame = function(){
  this.mask = null;
  this.error = false;
  this.frameType = DECODE;
}

dataFrame.prototype.parseFrame = function(data){
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
    this.rawData = new Buffer(decodeFrame);
    this.realData = this.rawData.toString('utf8', 0, this.dataLength);
  }
  return this;
}
module.exports = dataFrame;
