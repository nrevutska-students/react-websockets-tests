 class WebSocket {
  constructor(url) {    
    // `onmessage` should be overwritten by the code using the socket.
    this._onmessage = () => { };
    this.onopen = () => { };    
  }

  set onmessage(handler) {
    this._onmessage = handler
    WebSocket.instance = this;
  }

  static instance = {};

  addEventListener(event, cb) { 
    WebSocket.instance = this;     
      if(event === "message") {
          this.onmessage = cb;
      }
  }

  send(data) {    
    this._onmessage({data: data});
  }
};

module.exports = WebSocket;