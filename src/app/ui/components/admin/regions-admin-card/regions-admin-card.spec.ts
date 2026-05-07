import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Region } from '../../../../domain/models/regions.model';
import { RegionsAdminCard } from './regions-admin-card';

describe('RegionsAdminCard', () => {
  let component: RegionsAdminCard;
  let fixture: ComponentFixture<RegionsAdminCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionsAdminCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RegionsAdminCard);
    component = fixture.componentInstance;

    vi.spyOn(component as unknown as { initializeMap: () => void }, 'initializeMap').mockImplementation(() => undefined);
    vi.spyOn(component as unknown as { renderRegions: () => void }, 'renderRegions').mockImplementation(() => undefined);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display empty state when regions list is empty', () => {
    component.regions = [];
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nenhuma zona encontrada');
  });

  it('should render map and summaries when regions are provided', () => {
    component.regions = [
      { id: '1', region: 'A', latitude: -23.4, longitude: -49.1, created_at: '2026-05-04T00:00:00Z' } as Region,
      { id: '2', region: 'B', latitude: -23.5, longitude: -49.2, created_at: '2026-05-04T00:00:00Z' } as Region,
    ];
    component.stats = { total: 2, unique: 2 };
    fixture.detectChanges();

    const mapDiv = (fixture.nativeElement as HTMLElement).querySelector('div.min-h-\\[28rem\\]');
    expect(mapDiv).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('A');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('B');
  });

  it('should not render create button', () => {
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Nova Zona');
    expect(fixture.nativeElement.querySelectorAll('button[title="Atualizar lista"]').length).toBe(1);
  });

  it('should show polygon summary when a region has at least 3 points', () => {
    component.regions = [
      { id: '1', region: 'A', latitude: -23.4, longitude: -49.1, created_at: '2026-05-04T00:00:00Z' } as Region,
      { id: '2', region: 'A', latitude: -23.5, longitude: -49.2, created_at: '2026-05-04T00:00:00Z' } as Region,
      { id: '3', region: 'A', latitude: -23.45, longitude: -49.15, created_at: '2026-05-04T00:00:00Z' } as Region,
    ];
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('polígono renderizado');
  });
});
