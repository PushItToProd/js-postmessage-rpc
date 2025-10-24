
**Test machine:** MacBook with M2 Pro (10 cores, 16GB RAM)

**Iterations:** 100,000

| Environment | `rpc_single_MessageChannel` | `rpc_MessageChannel_per_request` |
| ----------- | --------------------------- | -------------------------------- |
| Node        | 0.005 ms/op                 | 0.010 ms/op                      |
| Firefox     | 0.008ms/op                  | 0.096 ms/op                      |
| Chrome      | 0.020ms/op                  | 0.023 ms/op                      |


