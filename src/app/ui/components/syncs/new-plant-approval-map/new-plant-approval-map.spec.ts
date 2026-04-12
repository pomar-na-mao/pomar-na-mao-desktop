import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPlantApprovalMapComponent } from './new-plant-approval-map';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import type { INewPlant } from '../../../../domain/models/new-plant.model';

describe('NewPlantApprovalMapComponent', () => {
  let component: NewPlantApprovalMapComponent;
  let fixture: ComponentFixture<NewPlantApprovalMapComponent>;
  const mockNewPlant: INewPlant = {
    id: '1-uuid',
    latitude: -23.5505,
    longitude: -46.6333,
    created_at: new Date().toISOString(),
    is_approved: false,
    region: 'São Paulo',
    gps_timestamp: null,
    updated_at: null
  };

  beforeEach(async () => {
    // Mock L (Leaflet) global or any internal map initialization
    // Since Leaflet uses browser globals, we might need to mock it if it's imported as a package
    // or if the component uses `import * as L from 'leaflet'`.

    // In many Vitest setups for Angular/Leaflet, we spy on the private initMap or just mock the package

    await TestBed.configureTestingModule({
      imports: [NewPlantApprovalMapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NewPlantApprovalMapComponent);
    component = fixture.componentInstance;

    // Set input
    fixture.componentRef.setInput('newPlant', mockNewPlant);

    // Mock private methods to avoid Leaflet DOM issues in test environment
    vi.spyOn(component as unknown as { initializeMap: () => void }, 'initializeMap').mockImplementation(() => { });
    vi.spyOn(component as unknown as { renderPlantMarker: () => void }, 'renderPlantMarker').mockImplementation(() => { });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a map container', () => {
    const mapDiv = fixture.debugElement.query(By.css('.absolute.inset-0.z-0'));
    expect(mapDiv).toBeTruthy();
  });

  it('should call initializeMap on afterViewInit', () => {
    const initializeMapSpy = vi.spyOn(component as unknown as { initializeMap: () => void }, 'initializeMap');
    component.ngAfterViewInit();
    expect(initializeMapSpy).toHaveBeenCalled();
  });
});
