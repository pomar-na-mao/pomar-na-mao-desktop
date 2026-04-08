import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { MassInclusionFormComponent } from './mass-inclusion-form';
import { MassInclusionViewModel } from '../../../view-models/mass-inclusion/mass-inclusion.view-model';
import { FormBuilder } from '@angular/forms';

describe('MassInclusionFormComponent', () => {
  let component: MassInclusionFormComponent;
  let fixture: ComponentFixture<MassInclusionFormComponent>;
  let mockViewModel: Partial<MassInclusionViewModel>;

  beforeEach(async () => {
    const fb = new FormBuilder();

    mockViewModel = {
      massInclusionDataForm: fb.group({
        occurrences: fb.nonNullable.control<string[]>([]),
        variety: fb.nonNullable.control<string>(''),
        lifeOfTree: fb.nonNullable.control<string>(''),
        plantingDate: fb.nonNullable.control<string>(''),
        description: fb.nonNullable.control<string>(''),
      }),
      canEditForm: signal(true),
      isSaving: signal(false),
      occurrenceOptions: signal([]),
      varietyOptions: signal([]),
      onSaveMassInclusionDataHandler: vi.fn().mockResolvedValue(undefined),
      onClearMassInclusionFormDataHandler: vi.fn(),
      onOccurrencesChange: vi.fn(),
      onVarietyChange: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MassInclusionFormComponent, ReactiveFormsModule, TranslateModule.forRoot()],
    })
      .overrideComponent(MassInclusionFormComponent, {
        set: {
          providers: [{ provide: MassInclusionViewModel, useValue: mockViewModel }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(MassInclusionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSaveMassInclusionData should delegate to view model', () => {
    component.onSaveMassInclusionData();
    expect(mockViewModel.onSaveMassInclusionDataHandler).toHaveBeenCalled();
  });

  it('onClearMassInclusionFormData should delegate to view model', () => {
    component.onClearMassInclusionFormData();
    expect(mockViewModel.onClearMassInclusionFormDataHandler).toHaveBeenCalled();
  });

  it('should render the form element', () => {
    const form = fixture.debugElement.query(By.css('form'));
    expect(form).toBeTruthy();
  });
});
