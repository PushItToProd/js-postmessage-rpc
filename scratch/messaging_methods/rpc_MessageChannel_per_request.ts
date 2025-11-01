// Experiment: an RPC client-server setup where each message gets its own
// MessageChannel for handling the response. This lets each request be isolated
// and avoids needing to save a request ID. However, the performance impact is
// not clear.

export class RpcServer {
  constructor(private port: MessagePort) {
    this.port.onmessage = this.onmessage;
  }

  onmessage(evt: MessageEvent) {
    // TODO: authenticate origin
    const replyPort = evt.ports?.[0];
    if (!replyPort) {
      throw "invalid message - missing replyPort";
    }

    const message = evt.data;
    if (!message) {
      throw "invalid message - event data is null";
    }

    switch (message) {
      case "ping":
        replyPort.postMessage("pong");
        break;
      default:
        replyPort.postMessage("error");
        break
    }
    replyPort.close();
  }
}

export class RpcTransport {
  // port is used for sending RPC messages. responses are received via ports
  // created for each request
  constructor(private port: MessagePort) {}

  postMessage(payload: any): Promise<any> {
    const {promise, resolve, reject} = Promise.withResolvers();

    // create a MessageChannel for this interaction
    const {port1: ourPort, port2: theirPort} = new MessageChannel();

    // handle response
    ourPort.onmessage = (evt) => {
      resolve(evt.data);
      ourPort.close();
      theirPort.close();
    };
    // TODO: set a timeout to avoid waiting forever

    this.port.postMessage(payload, [theirPort]);

    return promise;
  }
}
