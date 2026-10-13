import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { MapPolygonSelector } from './map-polygon-selector';

describe('MapPolygonSelector', () => {
  it('should allow drawing without plants only when explicitly enabled', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );

    expect(component.hasPlants).toBe(false);
    expect(component.canDraw).toBe(false);

    component.allowDrawingWithoutPlants = true;

    expect(component.canDraw).toBe(true);
  });

  it('should emit drawingStarted and request device location when drawing mode starts', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const emit = vi.spyOn(component.drawingStarted, 'emit');
    const getCurrentPosition = vi.fn();
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
    });
    component.allowDrawingWithoutPlants = true;
    component['map'] = {
      getContainer: () => ({ style: { cursor: '' } }),
    } as never;

    component.toggleDrawingMode();

    expect(emit).toHaveBeenCalled();
    expect(getCurrentPosition).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('should zoom to the focused polygon', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const fitBounds = vi.fn();
    component['map'] = { fitBounds } as never;

    component.focusedPolygon = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];

    expect(fitBounds).toHaveBeenCalledWith(expect.any(Object), {
      padding: [48, 48],
      maxZoom: 19,
    });
  });

  it('should request device location and set view when locateUserOnInit is true', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    component.locateUserOnInit = true;
    component.userLocationZoom = 18;

    const setView = vi.fn();
    const addLayer = vi.fn();
    component['map'] = {
      setView,
      addLayer,
    } as never;

    const getCurrentPosition = vi.fn((success) => {
      success({ coords: { latitude: -23.1234, longitude: -49.5678 } });
    });
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
    });

    component.centerOnCurrentDeviceLocation();

    expect(getCurrentPosition).toHaveBeenCalled();
    expect(setView).toHaveBeenCalledWith([-23.1234, -49.5678], 18);
    expect(addLayer).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('should center on device location when invalidateSize is called and locateUserOnInit is true', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    component.locateUserOnInit = true;
    component.userLocationZoom = 18;

    const invalidateSize = vi.fn();
    const setView = vi.fn();
    const addLayer = vi.fn();
    component['map'] = {
      invalidateSize,
      setView,
      addLayer,
    } as never;

    const getCurrentPosition = vi.fn((success) => {
      success({ coords: { latitude: -23.1234, longitude: -49.5678 } });
    });
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
    });

    component.invalidateSize();

    expect(invalidateSize).toHaveBeenCalled();
    expect(getCurrentPosition).toHaveBeenCalled();
    expect(setView).toHaveBeenCalledWith([-23.1234, -49.5678], 18);
    expect(addLayer).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
