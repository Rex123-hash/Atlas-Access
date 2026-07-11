import { describe, expect, it } from "vitest";
import { MinHeap } from "./heap";

describe("MinHeap", () => {
  it("pops items in ascending priority order", () => {
    const heap = new MinHeap<number>((n) => n);
    for (const v of [5, 3, 8, 1, 9, 2, 7, 4, 6]) heap.push(v);
    const out: number[] = [];
    while (heap.size > 0) out.push(heap.pop()!);
    expect(out).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("returns undefined when popping an empty heap", () => {
    const heap = new MinHeap<number>((n) => n);
    expect(heap.pop()).toBeUndefined();
    expect(heap.size).toBe(0);
  });

  it("orders by the provided priority function, not natural order", () => {
    const heap = new MinHeap<{ name: string; cost: number }>((n) => n.cost);
    heap.push({ name: "far", cost: 100 });
    heap.push({ name: "near", cost: 5 });
    heap.push({ name: "mid", cost: 50 });
    expect(heap.pop()?.name).toBe("near");
    expect(heap.pop()?.name).toBe("mid");
    expect(heap.pop()?.name).toBe("far");
  });
});
