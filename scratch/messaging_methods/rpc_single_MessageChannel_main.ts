import {RpcServer, RpcTransport} from "./rpc_single_MessageChannel.ts";

export async function main() {
  const {port1, port2} = new MessageChannel();

  let timeoutId: NodeJS.Timeout | undefined = undefined;
  const cleanup = () => {
    console.debug("cleaning up");
    clearTimeout(timeoutId);
    port1.close();
    port2.close();
  };
  timeoutId = setTimeout(() => {
    console.error("Timeout exceeded");
    cleanup();
    process.exit(1);
  }, 1000);

  const s = new RpcServer(port1);
  const t = new RpcTransport(port2);

  let response = await t.makeCall('ping');
  console.log("send 'ping' - got reply:", response);

  cleanup();
}

await main();