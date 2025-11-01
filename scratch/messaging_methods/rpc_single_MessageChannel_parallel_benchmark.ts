// Benchmark the cost of using one MessageChannel for all requests. On my Mac
// with an M2 Pro, this averages about 0.005ms per operation in Node, 0.008ms/op
// in Firefox, and 0.020ms/op in Chrome.
import { RpcServer, RpcTransport } from "./rpc_single_MessageChannel.ts";

const NUM_ITERATIONS = 100_000;

async function main() {
  const {port1, port2} = new MessageChannel();

  const s = new RpcServer(port1);
  const t = new RpcTransport(port2);

  const benchmarkStart = performance.now();
  let promises = new Array(NUM_ITERATIONS);
  for (let i = 0; i < NUM_ITERATIONS; i++) {
    promises[i] = t.makeCall("ping");
  }
  await Promise.all(promises);
  const benchmarkEnd = performance.now();
  const benchmarkTimeMs = benchmarkEnd - benchmarkStart;
  const avgTimeMs = benchmarkTimeMs / NUM_ITERATIONS;
  console.log("Ran %d iterations in %f ms (average: %f ms)", NUM_ITERATIONS, benchmarkTimeMs, avgTimeMs);

  port1.close();
  port2.close();
}

await main();

