# Comparing messaging methods

For RPC method calls, we want a way to send a request over a `MessageChannel` and get back the response for that request. Like any async operation, this can be implemented using `Promise`. 

Two main methods to compare:

(A) My initial idea was to generate a unique ID for each request. The client generates an ID, saves the `Promise` callbacks in a `Map` indexed by that ID, and sends the ID along with the request to the server. When the server responds, it includes the ID in the response. The client then looks up the `Promise` callbacks from the `Map` and invokes `resolve()` or `reject()` as appropriate.

(B) Alternatively, to simplify managing requests, we can use a separate `MessageChannel` for each request. This way, each request and response can be fully isolated and we don't have to generate or track unique IDs for each request and response.

Naturally, I assumed (B) would be slower, but I also figured it would reduce complexity enough that it could possibly be worth it depending on the performance impact. Therefore, I wanted to know just how much slower it is in practice.

## Benchmark

**Test machine:** MacBook with M2 Pro (10 cores, 16GB RAM)

**Iterations:** 100,000

### Single-threaded (every request `await`s its response)

| Environment             | (A) `rpc_single_MessageChannel` | (B) `rpc_MessageChannel_per_request` | (B) vs. (A) |
| ----------------------- | ------------------------------- | ------------------------------------ | ----------: |
| Node (v22.21.0)         | 0.005 ms/op (100%)              | 0.010 ms/op (100%)                   |        200% |
| Firefox (144.0)         | 0.008 ms/op  (160%)             | 0.096 ms/op (960%)                   |       1200% |
| Chrome (141.0.7390.123) | 0.020 ms/op  (400%)             | 0.023 ms/op (230%)                   |        115% |
| Average                 | 0.011 ms/op                     | 0.043 ms/op                          |        390% |

* The parenthesized percentages in each column compares vs. the best peforming environment for the same method (lower is better; 100% is best).
* "(B) vs. (A)" compares the different implementations' results for the same environment. 

## Analysis

* When requests are single-threaded (i.e. every request `await`s its response), using a single `MessageChannel` has much better performance than using a `MessageChannel` per request.
* This only looks at single-threaded performance, so it doesn't account for any overhead we might encounter when there are multiple parallel requests.
  * I suspect in a scenario with parallel requests, (B) would only perform worse.


## Further thoughts

It might be possible to pre-allocate and pool `MessagePort`s. However, pooling channels also reintroduces much of the complexity that method (B) is intended to eliminate, negating the advantages. In particular, since `MessagePort` objects are transferred between the client and server context, we would need to either transfer the `MessagePort` back to the client or otherwise generate unique IDs to keep track of the allocated ports on both the client and server.
