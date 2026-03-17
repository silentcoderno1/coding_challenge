/**
 * Problem 4: Three ways to sum to n
 *
 * Summation from 1 to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 *
 * Assumption: For n <= 0 we return 0 (empty sum). The problem states n is "any integer"
 * and the result is assumed to be less than Number.MAX_SAFE_INTEGER.
 */

/**
 * Implementation A: For loop (iterative)
 *
 * Complexity: O(n) time, O(1) space
 * - Iterates exactly n times (or 0 times when n <= 0)
 * - Constant extra space (one accumulator variable)
 * - Simple, readable, and efficient for moderate n. No risk of stack overflow.
 */
function sum_to_n_a(n: number): number {
  if (n <= 0) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Implementation B: Recursion
 *
 * Complexity: O(n) time, O(n) space (call stack)
 * - n recursive calls; each call does O(1) work
 * - Call stack depth is n, so space is O(n)
 * - Can hit stack overflow for large n (e.g. ~100k+ in typical JS engines).
 *   Good for small n or when recursion is stylistically preferred.
 */
function sum_to_n_b(n: number): number {
  if (n <= 0) return 0;
  return n + sum_to_n_b(n - 1);
}

/**
 * Implementation C: Closed-form formula (Gauss)
 *
 * Complexity: O(1) time, O(1) space
 * - Single arithmetic expression: n * (n + 1) / 2
 * - No loops or recursion; constant time and space
 * - Best choice for large n. Use integer division semantics: for odd n,
 *   n * (n + 1) is even so the result is always an integer.
 */
function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return Math.floor((n * (n + 1)) / 2);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
