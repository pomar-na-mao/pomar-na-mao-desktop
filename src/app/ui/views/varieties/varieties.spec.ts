import { Component, input, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmationService } from 'primeng/api';
import type { PolygonSelection } from '../../../domain/models/basic-data';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { ZoneAssignmentRepository } from '../../../data/repositories/zone-assignment/zone-assignment.repository';
import { VarietiesRepository } from '../../../data/repositories/varieties/varieties-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { LoadingService } from '../../../shared/services/loading.service';
import type { Variety } from '../../../domain/models/variety.model';
import { MapPolygonSelector } from '../../components/basic-data/map-polygon-selector/map-polygon-selector';
import { Varieties } from './varieties';

@Component({
  selector: 'app-map-polygon-selector',
  standalone: true,
  template: '<div data-testid="varieties-map"></div>',
})
class MockMapPolygonSelector {
  readonly center = input<[number, number]>();
  readonly zoom = input<number>();
  readonly locateUserOnInit = input<boolean>();
  readonly userLocationZoom = input<number>();
  readonly plants = input<unknown[]>();
  readonly allowDrawingWithoutPlants = input<boolean>();
  readonly backgroundPolygons = input<unknown[]>();
  readonly backgroundPolygonLabels = input<unknown[]>();
  readonly backgroundPolygonColors = input<unknown[]>();
  readonly backgroundPolygonDashArrays = input<unknown[]>();
  readonly backgroundPolygonFillOpacities = input<unknown[]>();
  readonly clearSignal = input<number>();
  readonly polygonSelected = output<PolygonSelection>();
  readonly polygonCleared = output<void>();

  public invalidateSize = vi.fn();
}

describe('Varieties', () => {
  let fixture: ComponentFixture<Varieties>;
  let component: Varieties;
  const item: Variety = {
    id: 1,
    name: 'Hass',
    description: 'Abacate Hass',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  };
  const varieties = signal<Variety[]>([item]);
  const allPlants = signal<any[]>([]);
  const zones = signal<any[]>([]);
  const regions = signal<any[]>([]);

  const repository = {
    varieties,
    findAll: vi.fn().mockResolvedValue({ error: null }),
    create: vi.fn(),
    createWithPlants: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn().mockResolvedValue({ error: null }),
  };

  const zonesRepo = {
    zones,
    findAll: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  const regionsRepo = {
    regions,
    findAll: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  const farmBoundaryService = {
    getBoundary: vi.fn().mockResolvedValue([]),
  };

  const zoneAssignmentRepo = {
    allPlants,
    loadAllPlants: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  const messages = { success: vi.fn(), error: vi.fn() };
  const loading = { show: vi.fn(), hide: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    varieties.set([item]);
    allPlants.set([]);
    zones.set([]);
    regions.set([]);

    repository.findAll.mockResolvedValue({ error: null });
    repository.deleteMany.mockResolvedValue({ error: null });
    zonesRepo.findAll.mockResolvedValue({ data: [], error: null });
    regionsRepo.findAll.mockResolvedValue({ data: [], error: null });
    zoneAssignmentRepo.loadAllPlants.mockResolvedValue({ data: [], error: null });
    farmBoundaryService.getBoundary.mockResolvedValue([]);

    await TestBed.configureTestingModule({
      imports: [Varieties],
      providers: [
        { provide: VarietiesRepository, useValue: repository },
        { provide: ZonesRepository, useValue: zonesRepo },
        { provide: RegionsRepository, useValue: regionsRepo },
        { provide: FarmBoundaryService, useValue: farmBoundaryService },
        { provide: ZoneAssignmentRepository, useValue: zoneAssignmentRepo },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
      ],
    })
      .overrideComponent(Varieties, {
        remove: { imports: [MapPolygonSelector] },
        add: { imports: [MockMapPolygonSelector] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Varieties);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and loads varieties, zones and plants on initialization', () => {
    expect(component).toBeTruthy();
    expect(repository.findAll).toHaveBeenCalled();
    expect(zoneAssignmentRepo.loadAllPlants).toHaveBeenCalled();
  });

  it('renders sidebar layout with new variety form and mini table', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Cadastro de Variedades');
    expect(root.textContent).toContain('Nova Variedade');
    expect(root.textContent).toContain('Variedades Cadastradas');
    expect(root.textContent).toContain('Hass');
    expect(root.textContent).toContain('Abacate Hass');

    const editBtn = root.querySelector('button[aria-label="Editar variedade"]') as HTMLButtonElement;
    const deleteBtn = root.querySelector('button[aria-label="Excluir variedade"]') as HTMLButtonElement;
    expect(editBtn).toBeTruthy();
    expect(deleteBtn).toBeTruthy();

    const openEditSpy = vi.spyOn(component.viewModel, 'openEdit');
    editBtn.click();
    expect(openEditSpy).toHaveBeenCalledWith(item);

    const confirmDeleteSpy = vi.spyOn(component, 'confirmDelete');
    deleteBtn.click();
    expect(confirmDeleteSpy).toHaveBeenCalledWith(item);
  });

  it('shows instruction card when no polygon is drawn and enables form after polygon selection', async () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Desenhe um polígono no mapa');

    component.onPolygonSelected({
      coordinates: [
        { lat: -23.1, lng: -49.1 },
        { lat: -23.2, lng: -49.1 },
        { lat: -23.2, lng: -49.2 },
      ],
      geoJson: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [-49.1, -23.1],
              [-49.1, -23.2],
              [-49.2, -23.2],
              [-49.1, -23.1],
            ],
          ],
        },
        properties: {},
      },
      area: 1000,
    });
    fixture.detectChanges();

    expect(root.textContent).toContain('3 vértices');
    expect(component.viewModel.hasPolygon()).toBe(true);
  });

  it('confirms and executes variety deletion', () => {
    const confirm = vi
      .spyOn(component.confirmationService, 'confirm')
      .mockImplementation(() => component.confirmationService);

    component.confirmDelete(item);
    expect(confirm).toHaveBeenCalled();

    const rowConfirmation = confirm.mock.calls[0][0];
    expect(rowConfirmation.message).toContain('Hass');
    expect(rowConfirmation.acceptButtonProps).toEqual({
      severity: 'danger',
      outlined: true,
    });

    rowConfirmation.accept?.();
    expect(repository.deleteMany).toHaveBeenCalledWith([1]);
  });

  it('toggles map fullscreen mode', () => {
    expect(component.viewModel.isMapFullscreen()).toBe(false);

    component.toggleFullscreen();
    expect(component.viewModel.isMapFullscreen()).toBe(true);

    component.toggleFullscreen();
    expect(component.viewModel.isMapFullscreen()).toBe(false);
  });
});
