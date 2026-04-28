import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SprayingFlow } from './spraying-flow';
import { SprayingSessionsTableComponent } from '../../components/spraying-flow/spraying-sessions-table/spraying-sessions-table';
import { SprayingFlowDetailPanelComponent } from '../../components/spraying-flow/spraying-flow-detail-panel/spraying-flow-detail-panel';
import { SprayingFlowViewModel } from '../../view-models/spraying-flow/spraying-flow.view-model';

@Component({
  selector: 'app-spraying-sessions-table',
  standalone: true,
  template: '<div class="mock-sessions-table"></div>',
})
class MockSprayingSessionsTableComponent {}

@Component({
  selector: 'app-spraying-flow-detail-panel',
  standalone: true,
  template: '<div class="mock-detail-panel"></div>',
})
class MockSprayingFlowDetailPanelComponent {}

describe('SprayingFlow', () => {
  let fixture: ComponentFixture<SprayingFlow>;
  let component: SprayingFlow;

  const mockViewModel = {
    loadSessions: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [SprayingFlow],
    })
      .overrideComponent(SprayingFlow, {
        remove: { imports: [SprayingSessionsTableComponent, SprayingFlowDetailPanelComponent] },
        add: { imports: [MockSprayingSessionsTableComponent, MockSprayingFlowDetailPanelComponent] },
      })
      .overrideComponent(SprayingFlow, {
        set: {
          providers: [{ provide: SprayingFlowViewModel, useValue: mockViewModel }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SprayingFlow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sessions on init', async () => {
    await component.ngOnInit();
    expect(mockViewModel.loadSessions).toHaveBeenCalled();
  });

  it('should render child panels', () => {
    expect(fixture.debugElement.query(By.css('.mock-sessions-table'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.mock-detail-panel'))).toBeTruthy();
  });
});
