import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';
import { DashboardMap } from './dashboard-map';

describe('DashboardMap', () => {
  let fixture: ComponentFixture<DashboardMap>;
  const viewModel = {
    isMapFullscreen: signal(false),
    initMap: vi.fn(),
    setMapFullscreen: vi.fn(),
    invalidateMapSize: vi.fn(),
  };

  beforeEach(async () => {
    viewModel.isMapFullscreen.set(false);
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DashboardMap],
      providers: [{ provide: DashboardViewModel, useValue: viewModel }],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardMap);
    fixture.detectChanges();
  });

  it('keeps a full-size map area and names the fullscreen control', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#dashboard-map')?.className).toContain('h-full');
    expect(root.querySelector('button[aria-label="Tela cheia"]')).toBeTruthy();
    expect(viewModel.initMap).toHaveBeenCalledWith('dashboard-map');
  });

  it('preserves fullscreen behavior and invalidates map size', () => {
    fixture.componentInstance.toggleFullscreen();
    expect(viewModel.setMapFullscreen).toHaveBeenCalledWith(true);
    expect(viewModel.invalidateMapSize).toHaveBeenCalledOnce();
  });
});
