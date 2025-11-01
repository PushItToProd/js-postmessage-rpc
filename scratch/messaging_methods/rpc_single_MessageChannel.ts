// Experiment: implement an RPC client-server setup where all messages get sent
// through a common MessageChannel.

type RpcMessage =
  {type: 'call', id: string, payload: string}
  | {type: 'reply', id: string, payload: string}
  | {type: 'error', id: string, error: string}
;

function isRpcMessage(obj: any): obj is RpcMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  if (typeof obj.type !== 'string' || typeof obj.id !== 'string') {
    return false;
  }
  switch (obj.type) {
    case 'call':
      return typeof obj.payload === 'string';
    case 'reply':
      return typeof obj.payload === 'string';
    case 'error':
      return typeof obj.error === 'string';
    default:
      return false;
  }
}

export class RpcServer {
  constructor(private port: MessagePort) {
    this.port.onmessage = this.onmessage.bind(this);
  }

  private postMessage(message: RpcMessage) {
    this.port.postMessage(message);
  }

  onmessage(evt: MessageEvent) {
    // TODO: authenticate origin
    const message = evt.data;
    if (!message) {
      throw "invalid message - event data is null";
    }

    const {id, payload} = message;
    if (!id) {
      throw "invalid message - no id";
    }
    if (!payload) {
      throw "invalid message - no payload";
    }

    switch (payload) {
      case "ping":
        this.postMessage({id, type: 'reply', payload: "pong"});
        break;
      default:
        this.postMessage({id, type: 'error', error: 'invalid message'});
        break
    }
  }
}

type PendingMessage = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

export class RpcTransport {
  // pendingMessages holds handlers for message responses
  pendingMessages = new Map<string, PendingMessage>();

  // port is used for sending RPC messages and receiving responses.
  constructor(private port: MessagePort) {
    this.port.onmessage = this.onmessage.bind(this);
  }

  onmessage(evt: MessageEvent) {
    const message = evt.data;

    if (!isRpcMessage(message)) {
      throw "invalid message - not an RpcMessage";
    }

    const {type, id} = message;
    const handlers = this.pendingMessages.get(id);
    if (!handlers) {
      throw `no pending message with id ${id}`;
    }

    switch (type) {
      case 'reply':
        handlers.resolve(message.payload);
        break;
      case 'error':
        handlers.reject(message.error);
        break;
      default:
        throw `invalid message type: ${type}`;
    }
  }

  private postMessage(payload: RpcMessage) {
    this.port.postMessage(payload);
  }

  makeCall(payload: string): Promise<any> {
    const {promise, resolve, reject} = Promise.withResolvers();

    // generate a unique ID for this request
    const id = crypto.randomUUID();

    // save the response handlers
    this.pendingMessages.set(id, {resolve, reject});

    // send the message
    this.postMessage({type: 'call', id, payload});

    return promise;
  }
}
