# Benchmark

**Test machine:** MacBook with M2 Pro (10 cores, 16GB RAM)

**Iterations:** 100,000

## Single-threaded (every request `await`s its response)

| Environment             | (A) `rpc_single_MessageChannel` | (B) `rpc_MessageChannel_per_request` | (B) vs. (A) |
| ----------------------- | ------------------------------- | ------------------------------------ | ----------: |
| Node (v22.21.0)         | 0.005 ms/op (100%)              | 0.010 ms/op (100%)                   |        200% |
| Firefox (144.0)         | 0.008 ms/op  (160%)             | 0.096 ms/op (960%)                   |       1200% |
| Chrome (141.0.7390.123) | 0.020 ms/op  (400%)             | 0.023 ms/op (230%)                   |        115% |

* "(B) vs. (A)" compares the different implementations' results for the same environment. 
* The parenthesized percentages in each column compares vs. the best peforming environment (lower is better; 100% is best).

## Conclusion

When requests are single-threaded (i.e. every request `await`s its response), using a single `MessageChannel` has much better performance than using a `MessageChannel` per request.
