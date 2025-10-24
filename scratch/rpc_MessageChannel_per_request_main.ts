import { RpcServer, RpcTransport } from "./messageChannelRoundTripper.js";

async function main() {
  const {port1, port2} = new MessageChannel();

  const s = new RpcServer(port1);
  const t = new RpcTransport(port2);

  let response = await t.postMessage("ping");
  console.log("send 'ping' - got reply:", response);

  port1.close();
  port2.close();
}

await main();
