import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OverviewViewModel } from '../../../view-models/overview/overview.view-model';
import { OverviewMap } from './overview-map';

describe('OverviewMap', () => {
  let fixture: ComponentFixture<OverviewMap>;
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
      imports: [OverviewMap],
      providers: [{ provide: OverviewViewModel, useValue: viewModel }],
    }).compileComponents();
    fixture = TestBed.createComponent(OverviewMap);
    fixture.detectChanges();
  });

  it('keeps a full-size map area and names the fullscreen control', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#overview-map')?.className).toContain('h-full');
    expect(root.querySelector('button[aria-label="Tela cheia"], [aria-label="Tela cheia"]')).toBeTruthy();
    expect(viewModel.initMap).toHaveBeenCalledWith('overview-map');
  });

  it('preserves fullscreen behavior and invalidates map size', () => {
    fixture.componentInstance.toggleFullscreen();
    expect(viewModel.setMapFullscreen).toHaveBeenCalledWith(true);
    expect(viewModel.invalidateMapSize).toHaveBeenCalledOnce();
  });
});
