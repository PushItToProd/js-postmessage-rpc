const {port1: clientPort, port2: serverPort} = new MessageChannel();

async function main() {
  // This promise is used to wait for onServerMessage to be called so the
  // program won't terminate early.
  let { promise, resolve } = Promise.withResolvers();

  const onServerMessage = function(e) {
    console.log("received message:", e);
    console.debug("data:", e.data);
    resolve();
  };
  serverPort.addEventListener('message', onServerMessage);

  clientPort.postMessage("Hello, MessageChannel!");

  await promise;
  // Once serverPort.onmessage() runs, close both ports so the program can
  // terminate.
  clientPort.close();
  serverPort.close();
}

await main();
