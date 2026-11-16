import { TestBed } from '@angular/core/testing';
import * as L from 'leaflet';
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

  it('should update map view when center input changes via ngOnChanges', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const setView = vi.fn();
    component['map'] = { setView } as never;
    component.zoom = 17;

    component.ngOnChanges({
      center: {
        currentValue: [-23.456, -49.789],
        previousValue: [-23.0, -49.0],
        firstChange: false,
        isFirstChange: () => false,
      },
    });

    expect(setView).toHaveBeenCalledWith([-23.456, -49.789], 17);
  });

  it('should not finalize a polygon with fewer than three distinct points', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const emit = vi.spyOn(component.polygonSelected, 'emit');
    component['tempPoints'] = [
      L.latLng(-23.1, -49.1),
      L.latLng(-23.1, -49.1),
      L.latLng(-23.2, -49.2),
    ];

    component.completePolygon();

    expect(component.distinctPointsCount).toBe(2);
    expect(component.hasPolygon).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });

  it('should add polygon points continuously while the pointer moves', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    component['drawingMode'] = true;
    component['tempPoints'] = [L.latLng(-23.1, -49.1)];
    component['map'] = { addLayer: vi.fn() } as never;

    component['onMouseMove']({
      latlng: L.latLng(-23.10002, -49.10002),
    } as L.LeafletMouseEvent);

    expect(component.activePoints).toHaveLength(2);
  });

  it('should mark a single-click checkpoint without closing the drawing', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const lastPoint = L.latLng(-23.10002, -49.10002);
    component['drawingMode'] = true;
    component['tempPoints'] = [
      L.latLng(-23.1, -49.1),
      lastPoint,
    ];
    component['map'] = { addLayer: vi.fn() } as never;

    component['checkpointDrawing'](L.latLng(-23.1000201, -49.1000201));

    expect(component.activePoints).toHaveLength(2);
    expect(component.checkpointCount).toBe(1);
    expect(component.drawingMode).toBe(true);
  });

  it('should not duplicate a checkpoint marker for repeated clicks at the same point', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const point = L.latLng(-23.1, -49.1);
    component['drawingMode'] = true;
    component['tempPoints'] = [point];
    component['map'] = { addLayer: vi.fn() } as never;

    component['checkpointDrawing'](point);
    component['checkpointDrawing'](point);

    expect(component.checkpointCount).toBe(1);
    expect(component.drawingMode).toBe(true);
  });

  it('should discard only the drawing after the last checkpoint when Escape is pressed', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const savedPoints = [
      L.latLng(-23.1, -49.1),
      L.latLng(-23.10002, -49.10002),
    ];
    const setLatLngs = vi.fn();
    const preventDefault = vi.fn();
    component['drawingMode'] = true;
    component['tempPoints'] = [
      ...savedPoints,
      L.latLng(-23.10004, -49.10004),
      L.latLng(-23.10006, -49.10006),
    ];
    component['checkpointPointCounts'] = [savedPoints.length];
    component['tempPolyline'] = { setLatLngs } as never;
    component['map'] = { removeLayer: vi.fn() } as never;

    component.handleKeyboardEvent({
      key: 'Escape',
      ctrlKey: false,
      preventDefault,
    } as unknown as KeyboardEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(component.activePoints).toEqual(savedPoints);
    expect(setLatLngs).toHaveBeenCalledWith(savedPoints);
    expect(component.drawingMode).toBe(true);
  });

  it('should clear the temporary path on Escape when there is no checkpoint', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    const removeLayer = vi.fn();
    const tempPolyline = { setLatLngs: vi.fn() };
    component['drawingMode'] = true;
    component['tempPoints'] = [L.latLng(-23.1, -49.1)];
    component['tempPolyline'] = tempPolyline as never;
    component['map'] = { removeLayer } as never;

    component.rollbackToLastCheckpoint();

    expect(component.activePoints).toEqual([]);
    expect(removeLayer).toHaveBeenCalledWith(tempPolyline);
    expect(component.drawingMode).toBe(true);
  });

  it('should render completed polygon boundaries with the thicker stroke', () => {
    const component = TestBed.runInInjectionContext(
      () => new MapPolygonSelector(),
    );
    component['tempPoints'] = [
      L.latLng(-23.1, -49.1),
      L.latLng(-23.2, -49.2),
      L.latLng(-23.3, -49.1),
    ];
    component['map'] = {
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      getContainer: () => ({ style: { cursor: '' } }),
    } as never;

    component.completePolygon();

    expect(component['drawnLayers'][0].options.weight).toBe(4.5);
    expect(component.backgroundPolygonWeight).toBe(4.5);
  });
});
