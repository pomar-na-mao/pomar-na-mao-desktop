import { describe, expect, it } from 'vitest';
import { rasterizeForecastMass } from './forecast-mass-layer';

describe('forecast mass interpolation', () => {
  const color = (points: [number, number, number][]) =>
    Array.from(
      rasterizeForecastMass(30, 30, points).slice(
        (15 * 30 + 15) * 4,
        (15 * 30 + 15) * 4 + 3,
      ),
    );

  it('does not turn overlapping small plants red', () => {
    const point: [number, number, number] = [60, 60, 5];
    expect(color(Array.from({ length: 1000 }, () => point))).toEqual(
      color([point]),
    );
    expect(color([point])).toEqual([37, 99, 235]);
  });

  it('distinguishes the four mass bands and interpolates neighboring masses', () => {
    const colors = [5, 15, 25, 35].map((kg) => color([[60, 60, kg]]).join(','));
    expect(new Set(colors).size).toBe(4);
    expect(
      color([
        [60, 60, 5],
        [60, 60, 25],
      ]),
    ).toEqual(color([[60, 60, 15]]));
  });

  it('clears empty data and ignores invalid or zero mass', () => {
    expect(
      rasterizeForecastMass(10, 10, [
        [20, 20, 0],
        [20, 20, NaN],
      ]).every((value) => value === 0),
    ).toBe(true);
    expect(
      rasterizeForecastMass(10, 10, []).every((value) => value === 0),
    ).toBe(true);
    expect(color([[60, 60, 100]])).toEqual([220, 38, 38]);
  });
});
