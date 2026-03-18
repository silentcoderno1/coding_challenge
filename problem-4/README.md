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

**Why `--project problem-4/tsconfig.json`:** Node’s ESM loader does not resolve extensionless imports like `./sum_to_n`. The local `tsconfig` uses **CommonJS** so `ts-node` resolves `sum_to_n.ts` correctly.

From **repo root**:

```bash
npx ts-node --project problem-4/tsconfig.json problem-4/run_example.ts
```

From **`problem-4/`**:

```bash
cd problem-4
npx ts-node run_example.ts
```

Or with **tsx** (often works without extra flags):

```bash
npx tsx problem-4/run_example.ts
```

Expected output: each implementation prints 15, 1, 0, 0 for inputs 5, 1, 0, -3.
