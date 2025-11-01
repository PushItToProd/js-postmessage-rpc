// Benchmark the cost of creating a MessageChannel for each request. On my Mac
// with an M2 Pro, this averages about 0.010ms per operation in Node, 0.096ms/op
// in Firefox, and 0.023ms/op in Chrome.
import { RpcServer, RpcTransport } from "./rpc_MessageChannel_per_request.ts";

const NUM_ITERATIONS = 100_000;

async function main() {
  const {port1, port2} = new MessageChannel();

  const s = new RpcServer(port1);
  const t = new RpcTransport(port2);

  const benchmarkStart = performance.now();
  for (let i = 0; i < NUM_ITERATIONS; i++) {
    let _response = await t.postMessage("ping");
  }
  const benchmarkEnd = performance.now();
  const benchmarkTimeMs = benchmarkEnd - benchmarkStart;
  const avgTimeMs = benchmarkTimeMs / NUM_ITERATIONS;
  console.log("Ran %d iterations in %f ms (average: %f ms)", NUM_ITERATIONS, benchmarkTimeMs, avgTimeMs);

  port1.close();
  port2.close();
}

await main();

