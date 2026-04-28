import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';
import { SprayingSessionsTableComponent } from './spraying-sessions-table';

describe('SprayingSessionsTableComponent', () => {
  let fixture: ComponentFixture<SprayingSessionsTableComponent>;
  let component: SprayingSessionsTableComponent;

  const sessions = signal([
    { id: 'session-1', started_at: '2026-04-28T10:00:00Z', created_at: '2026-04-28T10:00:00Z', region: 'north', status: 'completed', water_volume_liters: 10 },
    { id: 'session-2', started_at: '2026-04-27T10:00:00Z', created_at: '2026-04-27T10:00:00Z', region: 'south', status: 'in_progress', water_volume_liters: null },
  ]);

  const mockViewModel = {
    sessions,
    selectedSessionId: signal<string | null>('session-1'),
    isLoadingSessions: signal(false),
    error: signal<string | null>(null),
    totalSessions: signal(2),
    selectSession: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [SprayingSessionsTableComponent, TranslateModule.forRoot()],
      providers: [{ provide: SprayingFlowViewModel, useValue: mockViewModel }],
    }).compileComponents();

    fixture = TestBed.createComponent(SprayingSessionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render one row per session', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('should delegate session selection to the view model', async () => {
    const row = fixture.debugElement.queryAll(By.css('tbody tr'))[1];
    await row.triggerEventHandler('click');

    expect(mockViewModel.selectSession).toHaveBeenCalledWith('session-2');
  });

  it('should show empty state when there are no sessions', () => {
    sessions.set([]);
    fixture.detectChanges();

    const row = fixture.debugElement.query(By.css('tbody tr'));
    expect(row.nativeElement.textContent).toContain('PAGES.SPRAYING_FLOW.TABLE.EMPTY');
  });
});
