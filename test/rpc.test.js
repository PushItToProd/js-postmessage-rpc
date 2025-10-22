import * as assert from "node:assert";

// stub
let rpcBridge = {
  async getInt() {
    return 42;
  }
}

describe("RPC bridge examples", function () {
  describe("call('getInt')", function () {
    it("should return an integer value", async function () {
      let n = await rpcBridge.getInt();
      assert.equal(n, 42);
    });
  });
});
