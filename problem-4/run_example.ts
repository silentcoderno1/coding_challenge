/**
 * Run this with: npx ts-node problem-4/run_example.ts
 * Or: npx tsx problem-4/run_example.ts
 */
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n";

const test = (label: string, fn: (n: number) => number) => {
  console.log(`${label}: sum_to_n(5) = ${fn(5)} (expected 15)`);
  console.log(`${label}: sum_to_n(1) = ${fn(1)} (expected 1)`);
  console.log(`${label}: sum_to_n(0) = ${fn(0)} (expected 0)`);
  console.log(`${label}: sum_to_n(-3) = ${fn(-3)} (expected 0)`);
};

test("A (loop)", sum_to_n_a);
test("B (recursion)", sum_to_n_b);
test("C (formula)", sum_to_n_c);
