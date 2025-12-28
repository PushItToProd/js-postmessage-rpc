// Idea: a JS Proxy object that invokes methods on a remote object over a
// `MessageChannel` RPC protocol.

const {port1: clientPort, port2: serverPort} = new MessageChannel();

export interface ProxyMessage {
  requestId: string;
}

const targetObject = {
  foo: 123,
  bar: 456,
  baz: 789,
};

interface ProxyGetRequest extends ProxyMessage {
  prop: string;
};

function isProxyGetRequest(message: any): message is ProxyGetRequest {
  return (
    typeof message === 'object'
    && message !== null
    && typeof message.requestId === 'string'
    && typeof message.prop === 'string'
  );
}

interface ProxyGetResponse extends ProxyMessage {
  value: any;
};

function isProxyGetResponse(message: any): message is ProxyGetResponse {
  return (
    typeof message === 'object'
    && message !== null
    && typeof message.requestId === 'string'
    && 'value' in message
  );
}

// MessagePortProxyServer exposes a single object
class MessagePortProxyServer {
  port: MessagePort;
  object: any;

  constructor(port: MessagePort, object: any) {
    this.port = port;
    this.object = object;
    port.addEventListener("message", this.onmessage);
  }

  onmessage(event: MessageEvent<any>) {
    // TODO: validate message origin and stuff like that

    let payload = event.data;
    if (!isProxyGetRequest(payload)) {
      console.warn("Received invalid ProxyGetRequest:", payload);
      return;
    }

    let { requestId, prop } = payload;
    let value = this.object[prop];

    let response: ProxyGetResponse = {
      requestId,
      value,
    };

    this.port.postMessage(response);
  }
}

type PendingRequestHandler = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

class MessagePortProxyClient {
  port: MessagePort;
  pendingRequests: Map<string, PendingRequestHandler> = new Map();

  constructor(port: MessagePort) {
    this.port = port;
  }

  onmessage(event: MessageEvent<any>) {
    let payload = event.data;
    if (!isProxyGetResponse(payload)) {
      console.warn("Received invalid ProxyGetResponse:", payload);
      return;
    }

    let { requestId, value } = payload;
    let pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      console.warn("Received response for unknown requestId:", requestId);
      return;
    }

    this.pendingRequests.delete(requestId);
    pendingRequest.resolve(value);
  }

  get proxy() {
    const _this = this;
    return new Proxy({}, {
      get(_target, prop, _receiver) {
        let requestId = crypto.randomUUID();

        let request: ProxyGetRequest = {
          requestId,
          prop: String(prop),
        };

        return new Promise<any>((resolve, reject) => {
          _this.pendingRequests.set(requestId, { resolve, reject });
          _this.port.postMessage(request);
        });
      },
    })
  }

}


export async function main() {
  let { promise, resolve } = Promise.withResolvers();

  const server = new MessagePortProxyServer(serverPort, targetObject);
  const client = new MessagePortProxyClient(clientPort);

  // TODO

  await promise;
  clientPort.close();
  serverPort.close();
}

await main();
