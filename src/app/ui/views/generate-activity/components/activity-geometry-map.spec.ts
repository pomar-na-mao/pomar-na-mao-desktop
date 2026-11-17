import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ActivityGeometryMap } from './activity-geometry-map';

describe('ActivityGeometryMap', () => {
  it('renders area geometry with the thicker polygon stroke', () => {
    const component = TestBed.runInInjectionContext(
      () => new ActivityGeometryMap(),
    );
    component.geometryType = 'area';
    component.points = [
      [-49.1, -23.1],
      [-49.2, -23.2],
      [-49.1, -23.3],
    ];
    component['map'] = { addLayer: vi.fn() } as never;

    component['renderGeometry']();

    expect(component['geometryLayer']?.options.weight).toBe(4.5);
  });

  it('renders routes and dashed property boundaries with thicker strokes', () => {
    const routeComponent = TestBed.runInInjectionContext(
      () => new ActivityGeometryMap(),
    );
    routeComponent.geometryType = 'route';
    routeComponent.points = [
      [-49.1, -23.1],
      [-49.2, -23.2],
    ];
    routeComponent['map'] = { addLayer: vi.fn() } as never;

    routeComponent['renderGeometry']();

    expect(routeComponent['geometryLayer']?.options.weight).toBe(5);

    const boundaryComponent = TestBed.runInInjectionContext(
      () => new ActivityGeometryMap(),
    );
    boundaryComponent.boundary = [
      { latitude: -23.1, longitude: -49.1 },
      { latitude: -23.2, longitude: -49.2 },
      { latitude: -23.3, longitude: -49.1 },
    ];
    boundaryComponent['map'] = {
      addLayer: vi.fn(),
      fitBounds: vi.fn(),
    } as never;

    boundaryComponent['renderBoundary']();

    expect(boundaryComponent['boundaryLayer']?.options.weight).toBe(4);
    expect(boundaryComponent['boundaryLayer']?.options.dashArray).toBe('4, 4');
  });
});
