import { describe, it, expect } from 'vitest';
import { fallbackMatrix, haversineMinutes } from '@/lib/osrm';

describe('OSRM helpers', () => {
  it('fallbackMatrix returns symmetric minutes with zero diagonal', () => {
    const coords = [
      { lng: -97.7431, lat: 30.2672 }, // Austin
      { lng: -97.7265, lat: 30.4021 }, // Domain area
    ];
    const m = fallbackMatrix(coords);
    expect(m.length).toBe(2);
    expect(m[0][0]).toBe(0);
    expect(m[1][1]).toBe(0);
    expect(Math.round(m[0][1])).toBeGreaterThan(0);
    expect(Math.round(m[0][1])).toBe(Math.round(m[1][0]));
  });

  it('haversineMinutes scales reasonably with distance', () => {
    const a = { lng: -97.7431, lat: 30.2672 };
    const b = { lng: -97.7265, lat: 30.4021 };
    const minutes = haversineMinutes(a, b, 60); // 60 km/h
    expect(minutes).toBeGreaterThan(5);
    expect(minutes).toBeLessThan(60);
  });
});

