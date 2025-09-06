// Nearest neighbor heuristic for ordering stops by a travel-time matrix.
// matrix[i][j] = minutes from i to j. Returns an order (indices) starting from startIndex.

export function nearestNeighborOrder(matrix: number[][], startIndex = 0): number[] {
  const n = matrix.length;
  if (n === 0) return [];
  if (startIndex < 0 || startIndex >= n) throw new Error('Invalid startIndex');
  const visited = new Array(n).fill(false);
  const order: number[] = [startIndex];
  visited[startIndex] = true;
  let current = startIndex;
  for (let step = 1; step < n; step++) {
    let next = -1;
    let best = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[current][j] >= 0 && matrix[current][j] < best) {
        best = matrix[current][j];
        next = j;
      }
    }
    if (next === -1) {
      // disconnected; pick any remaining
      for (let j = 0; j < n; j++) if (!visited[j]) {
        next = j;
        break;
      }
    }
    visited[next] = true;
    order.push(next);
    current = next;
  }
  return order;
}

