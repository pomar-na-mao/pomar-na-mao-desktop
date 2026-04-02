import { computed, effect, Injectable, inject, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import type { AppSelectOption } from "../../../shared/components";
import { occurenceKeys, occurencesLabels } from "../../../shared/utils/occurrences";
import { varieties } from "../../../shared/utils/varieties";
import {
  MassInclusionRepository,
  type MassInclusionDraft,
} from "../../../data/repositories/mass-inclusion/mass-inclusion.repository";
import type { PolygonCoordinate, PolygonSelection } from "../../components/mass-inclusion/map-polygon-selector/map-polygon-selector";
import type { BooleanKeys } from "../../../domain/models/plant-data.model";

interface MassInclusionFormValue {
  occurrences: string[];
  variety: string;
  lifeOfTree: string;
  plantingDate: string;
  description: string;
}

@Injectable()
export class MassInclusionViewModel {
  private formBuilder = inject(FormBuilder);
  private massInclusionRepository = inject(MassInclusionRepository);

  public selectedPolygonCoordinates = this.massInclusionRepository.selectedPolygonCoordinates;
  public isSaving = signal(false);

  public form = this.formBuilder.group({
    occurrences: this.formBuilder.nonNullable.control<string[]>([]),
    variety: this.formBuilder.nonNullable.control<string>(''),
    lifeOfTree: this.formBuilder.nonNullable.control<string>('', [Validators.maxLength(80)]),
    plantingDate: this.formBuilder.nonNullable.control<string>(''),
    description: this.formBuilder.nonNullable.control<string>('', [Validators.maxLength(500)]),
  });

  public canEditForm = computed(() => this.selectedPolygonCoordinates().length >= 3);

  public occurrenceOptions = computed<AppSelectOption[]>(() =>
    occurenceKeys.map((key) => ({
      value: key,
      label: occurencesLabels[key],
    }))
  );

  public varietyOptions = computed<AppSelectOption[]>(() =>
    varieties.map((variety) => ({
      value: variety,
      label: variety,
    }))
  );

  constructor() {
    const draft = this.massInclusionRepository.draft();
    this.form.patchValue(draft, { emitEvent: false });

    effect(() => {
      const isEnabled = this.canEditForm();
      if (isEnabled) {
        this.form.enable({ emitEvent: false });
      } else {
        this.form.disable({ emitEvent: false });
      }
    });
  }

  public onPolygonSelected(selection: PolygonSelection): void {
    if (!this.isValidPolygon(selection.coordinates)) {
      return;
    }

    this.massInclusionRepository.savePolygonCoordinates(selection.coordinates);
  }

  public onPolygonCleared(): void {
    this.massInclusionRepository.clearPolygonCoordinates();
  }

  public onOccurrencesChange(value: string | string[]): void {
    const nextOccurrences = Array.isArray(value) ? value : value ? [value] : [];
    this.form.controls.occurrences.setValue(nextOccurrences);
  }

  public onVarietyChange(value: string | string[]): void {
    this.form.controls.variety.setValue(Array.isArray(value) ? (value[0] ?? '') : value);
  }

  public clearForm(): void {
    this.form.reset(
      {
        occurrences: [],
        variety: '',
        lifeOfTree: '',
        plantingDate: '',
        description: '',
      },
      { emitEvent: false }
    );

    this.massInclusionRepository.clearDraft();
  }

  public saveForm(): void {
    if (!this.canEditForm()) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.isSaving.set(true);
    const draft = this.toDraft(this.form.getRawValue() as MassInclusionFormValue);

    console.log('Mass Inclusion Save:', {
      formValue: this.form.getRawValue(),
      draft,
      coordinates: this.selectedPolygonCoordinates(),
    });

    this.massInclusionRepository.saveDraft(draft);
    this.isSaving.set(false);
  }

  private isValidPolygon(coordinates: PolygonCoordinate[]): boolean {
    if (coordinates.length < 3) {
      return false;
    }

    return coordinates.every((coordinate) => Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng));
  }

  private toDraft(value: MassInclusionFormValue): MassInclusionDraft {
    const occurrences = value.occurrences.filter((occurrence): occurrence is BooleanKeys =>
      occurenceKeys.includes(occurrence as BooleanKeys)
    );

    return {
      occurrences,
      variety: value.variety,
      lifeOfTree: value.lifeOfTree.trim(),
      plantingDate: value.plantingDate,
      description: value.description.trim(),
    };
  }
}
