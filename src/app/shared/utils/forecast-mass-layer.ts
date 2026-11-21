import * as L from 'leaflet';

const STEP = 4;
const RADIUS = 7; // 28 screen pixels, independent of zoom and plant density.
const STOPS = [
  [0, 37, 99, 235],
  [5, 37, 99, 235],
  [15, 234, 179, 8],
  [25, 249, 115, 22],
  [40, 220, 38, 38],
];

/** Gaussian interpolation of kg/plant, not an additive density heatmap. */
export function rasterizeForecastMass(
  width: number,
  height: number,
  points: readonly (readonly [number, number, number])[],
): Uint8ClampedArray {
  const sums = new Float64Array(width * height);
  const coverage = new Float64Array(width * height);
  for (const [px, py, kg] of points) {
    if (!Number.isFinite(kg) || kg <= 0) continue;
    const cx = px / STEP;
    const cy = py / STEP;
    for (
      let y = Math.max(0, Math.floor(cy - RADIUS));
      y <= Math.min(height - 1, Math.ceil(cy + RADIUS));
      y++
    ) {
      for (
        let x = Math.max(0, Math.floor(cx - RADIUS));
        x <= Math.min(width - 1, Math.ceil(cx + RADIUS));
        x++
      ) {
        const distance = (x - cx) ** 2 + (y - cy) ** 2;
        if (distance > RADIUS ** 2) continue;
        const weight = Math.exp(-distance / 12);
        const index = y * width + x;
        sums[index] += kg * weight;
        coverage[index] += weight;
      }
    }
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < coverage.length; i++) {
    if (!coverage[i]) continue;
    const kg = Math.min(40, sums[i] / coverage[i]);
    const upper = STOPS.findIndex((stop) => stop[0] >= kg);
    const right = STOPS[Math.max(1, upper)];
    const left = STOPS[Math.max(0, upper - 1)];
    const ratio = (kg - left[0]) / (right[0] - left[0]);
    for (let channel = 0; channel < 3; channel++) {
      pixels[i * 4 + channel] =
        left[channel + 1] + ratio * (right[channel + 1] - left[channel + 1]);
    }
    pixels[i * 4 + 3] = 220 * Math.min(1, coverage[i]);
  }
  return pixels;
}

export class ForecastMassLayer extends L.Layer {
  private canvas?: HTMLCanvasElement;
  private forecastMap?: L.Map;

  constructor(private points: L.LatLngTuple[]) {
    super();
  }

  public setLatLngs(points: L.LatLngTuple[]): this {
    this.points = points;
    this.redraw();
    return this;
  }

  public override onAdd(map: L.Map): this {
    this.forecastMap = map;
    this.canvas = L.DomUtil.create('canvas', 'leaflet-layer leaflet-zoom-hide');
    this.canvas.style.pointerEvents = 'none';
    map.getPanes().overlayPane.appendChild(this.canvas);
    this.redraw();
    return this;
  }

  public override onRemove(): this {
    this.canvas?.remove();
    this.canvas = undefined;
    this.forecastMap = undefined;
    return this;
  }

  public override getEvents(): Record<string, L.LeafletEventHandlerFn> {
    return { moveend: this.redraw, zoomend: this.redraw, resize: this.redraw };
  }

  private redraw = (): void => {
    const map = this.forecastMap;
    const canvas = this.canvas;
    if (!map || !canvas) return;
    const size = map.getSize();
    const width = Math.max(1, Math.ceil(size.x / STEP));
    const height = Math.max(1, Math.ceil(size.y / STEP));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width * STEP}px`;
    canvas.style.height = `${height * STEP}px`;
    L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));
    const context = canvas.getContext('2d');
    if (!context) return;
    const points = this.points.map(([lat, lng, kg]) => {
      const point = map.latLngToContainerPoint([lat, lng]);
      return [point.x, point.y, kg ?? 0] as const;
    });
    const image = context.createImageData(width, height);
    image.data.set(rasterizeForecastMass(width, height, points));
    context.putImageData(image, 0, 0);
  };
}
