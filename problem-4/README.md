# Problem 4: Three ways to sum to n

Three TypeScript implementations of **sum_to_n(n)** = 1 + 2 + … + n (e.g. `sum_to_n(5) === 15`).

## Implementations

| Function       | Approach        | Time  | Space | Notes                                      |
|----------------|-----------------|-------|-------|--------------------------------------------|
| `sum_to_n_a`   | For loop        | O(n)  | O(1)  | Simple, no stack overflow risk             |
| `sum_to_n_b`   | Recursion       | O(n)  | O(n)  | Stack depth = n; avoid for very large n    |
| `sum_to_n_c`   | Gauss formula   | O(1)  | O(1)  | `n * (n + 1) / 2`; best for large n        |

**Assumption:** For `n <= 0` the result is `0` (empty sum). Input is assumed to keep the result below `Number.MAX_SAFE_INTEGER`.

## Run

From repo root:

```bash
npx ts-node problem-4/run_example.ts
```

Or with tsx:

```bash
npx tsx problem-4/run_example.ts
```

Expected output: each implementation prints 15, 1, 0, 0 for inputs 5, 1, 0, -3.
