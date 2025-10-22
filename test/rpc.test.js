import * as assert from "node:assert";
import { rpcBridge } from "../src/rpcStub.js";

describe("RPC bridge examples", function () {
  describe("call('getInt')", function () {
    it("should return an integer value", async function () {
      let n = await rpcBridge.getInt();
      assert.equal(n, 42);
    });
  });
});
