import { describe, it, expect } from 'vitest';
import { nearestNeighborOrder } from '@/lib/tour/order';

describe('nearestNeighborOrder', () => {
  it('returns empty for empty matrix', () => {
    expect(nearestNeighborOrder([])).toEqual([]);
  });

  it('finds a reasonable order', () => {
    // Simple triangle: 0->1->2
    const m = [
      [0, 1, 5],
      [1, 0, 1],
      [5, 1, 0],
    ];
    expect(nearestNeighborOrder(m, 0)).toEqual([0, 1, 2]);
  });

  it('handles disconnected entries by picking any remaining', () => {
    const m = [
      [0, -1, 2],
      [-1, 0, -1],
      [2, -1, 0],
    ];
    const order = nearestNeighborOrder(m, 0);
    expect(order.length).toBe(3);
    expect(order[0]).toBe(0);
  });
});
