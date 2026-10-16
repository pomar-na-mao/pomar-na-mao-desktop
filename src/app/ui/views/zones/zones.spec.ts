import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZoneAssignment } from '../zone-assignment/zone-assignment';
import { ZoneMapManagement } from '../zone-map-management/zone-map-management';
import { Zones } from './zones';

@Component({
  selector: 'app-zone-map-management',
  standalone: true,
  template: '<div data-testid="mock-zone-map-management"></div>',
})
class MockZoneMapManagement {
  public mapSelector = {
    invalidateSize: vi.fn(),
  };
}

@Component({
  selector: 'app-zone-assignment',
  standalone: true,
  template: '<div data-testid="mock-zone-assignment"></div>',
})
class MockZoneAssignment {
  public mapSelector = {
    invalidateSize: vi.fn(),
  };
}

describe('Zones Component', () => {
  let fixture: ComponentFixture<Zones>;
  let component: Zones;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let queryParamsSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockActivatedRoute: {
    snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> };
    queryParamMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };
    queryParamsSubject = new BehaviorSubject(convertToParamMap({}));
    mockActivatedRoute = {
      snapshot: {
        queryParamMap: convertToParamMap({}),
      },
      queryParamMap: queryParamsSubject,
    };

    await TestBed.configureTestingModule({
      imports: [Zones],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    })
      .overrideComponent(Zones, {
        remove: { imports: [ZoneMapManagement, ZoneAssignment] },
        add: { imports: [MockZoneMapManagement, MockZoneAssignment] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Zones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render horizontal navigation bar with accessible role attributes', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const tablist = compiled.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();
    expect(tablist?.getAttribute('aria-label')).toBe('Navegação de Zonas');

    const tabs = compiled.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);

    const managementTab = compiled.querySelector('#tab-cadastro');
    const assignmentTab = compiled.querySelector('#tab-atribuicao');

    expect(managementTab).toBeTruthy();
    expect(assignmentTab).toBeTruthy();
    expect(managementTab?.getAttribute('aria-selected')).toBe('true');
    expect(assignmentTab?.getAttribute('aria-selected')).toBe('false');
  });

  it('should default activeTab to "cadastro" and display the management panel', () => {
    fixture.detectChanges();
    expect(component.activeTab()).toBe('cadastro');

    const compiled = fixture.nativeElement as HTMLElement;
    const managementPanel = compiled.querySelector('#panel-cadastro');
    const assignmentPanel = compiled.querySelector('#panel-atribuicao');

    expect(managementPanel?.classList.contains('hidden')).toBe(false);
    expect(assignmentPanel?.classList.contains('hidden')).toBe(true);
  });

  it('should switch to "atribuicao" tab when clicking assignment tab button', async () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const assignmentTab = compiled.querySelector<HTMLButtonElement>('#tab-atribuicao');

    assignmentTab?.click();
    fixture.detectChanges();

    expect(component.activeTab()).toBe('atribuicao');
    expect(assignmentTab?.getAttribute('aria-selected')).toBe('true');

    const managementPanel = compiled.querySelector('#panel-cadastro');
    const assignmentPanel = compiled.querySelector('#panel-atribuicao');

    expect(managementPanel?.classList.contains('hidden')).toBe(true);
    expect(assignmentPanel?.classList.contains('hidden')).toBe(false);

    expect(mockRouter.navigate).toHaveBeenCalledWith([], {
      relativeTo: mockActivatedRoute,
      queryParams: { aba: 'atribuicao' },
      queryParamsHandling: 'merge',
    });
  });

  it('should trigger map resize when switching tab', () => {
    const triggerSpy = vi.spyOn(component, 'triggerMapResize');

    component.setActiveTab('atribuicao');
    expect(triggerSpy).toHaveBeenCalledWith('atribuicao');

    component.setActiveTab('cadastro');
    expect(triggerSpy).toHaveBeenCalledWith('cadastro');
  });

  it('should initialize with "atribuicao" tab when route query param contains aba=atribuicao', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Zones],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ aba: 'atribuicao' }) },
            queryParamMap: new BehaviorSubject(convertToParamMap({ aba: 'atribuicao' })),
          },
        },
      ],
    })
      .overrideComponent(Zones, {
        remove: { imports: [ZoneMapManagement, ZoneAssignment] },
        add: { imports: [MockZoneMapManagement, MockZoneAssignment] },
      })
      .compileComponents();

    const customFixture = TestBed.createComponent(Zones);
    customFixture.detectChanges();
    expect(customFixture.componentInstance.activeTab()).toBe('atribuicao');
  });
});
