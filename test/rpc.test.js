import * as assert from "node:assert";
import { RpcBridge } from "../src/rpcStub.js";

let rpcBridge = new RpcBridge();

describe("RPC bridge examples", function () {
  describe("call('getInt')", function () {
    it("should return an integer value", async function () {
      let n = await rpcBridge.getInt();
      assert.equal(n, 42);
    });
  });
});
