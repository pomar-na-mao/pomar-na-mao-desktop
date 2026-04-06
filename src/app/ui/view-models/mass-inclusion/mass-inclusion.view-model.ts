import { computed, effect, Injectable, inject, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { PlantsRepository } from "../../../data/repositories/plants/plants-repository";
import { RegionsRepository } from "../../../data/repositories/regions/regions-repository";
import {
  MassInclusionRepository,
} from "../../../data/repositories/mass-inclusion/mass-inclusion.repository";
import type { MassInclusionData, MassInclusionFormValue, MassInclusionInfo, PolygonCoordinate, PolygonSelection } from "../../../domain/models/mass-inclusion";
import type { BooleanKeys, Plant } from "../../../domain/models/plant-data.model";
import type { Region } from "../../../domain/models/regions.model";
import type { AppSelectOption } from "../../../shared/components";
import { getConvexHull } from "../../../shared/utils/geolocation-math";
import { occurenceKeys, occurencesLabels } from "../../../shared/utils/occurrences";
import { varieties } from "../../../shared/utils/varieties";

@Injectable()
export class MassInclusionViewModel {
  private formBuilder = inject(FormBuilder);
  private massInclusionRepository = inject(MassInclusionRepository);
  private plantsRepository = inject(PlantsRepository);
  private regionsRepository = inject(RegionsRepository);

  public selectedRegionId = signal('');
  public isLoadingRegions = signal(true);
  public plants = signal<Plant[]>([]);

  public regionsGroupedByName = computed(() => {
    const groups = new Map<string, Region[]>();
    const regions = this.regionsRepository.regions();
    for (const region of regions) {
      const normalizedName = (region.region ?? '').trim().toLocaleLowerCase();
      if (!groups.has(normalizedName)) {
        groups.set(normalizedName, []);
      }
      groups.get(normalizedName)!.push(region);
    }
    return groups;
  });

  public uniqueRegions = computed(() => {
    const uniqueByName = new Map<string, Region>();

    for (const region of this.regionsRepository.regions()) {
      const normalizedName = (region.region ?? '').trim().toLocaleLowerCase();
      if (!uniqueByName.has(normalizedName)) {
        uniqueByName.set(normalizedName, region);
      }
    }

    return Array.from(uniqueByName.values());
  });

  public regionOptions = computed<AppSelectOption[]>(() =>
    this.uniqueRegions().map((region) => ({
      value: region.id,
      label: region.region,
    }))
  );

  public backgroundPolygon = computed(() => {
    const regionId = this.selectedRegionId();
    const regions = this.regionsGroupedByName();
    const selectedRegion = this.findRegionById(regionId);

    if (!selectedRegion) return null;

    const normalizedName = selectedRegion.region.trim().toLocaleLowerCase();
    const points = regions.get(normalizedName);

    if (!points || points.length === 0) return null;

    const rawCoords = points.map((p) => [p.latitude, p.longitude] as [number, number]);
    return getConvexHull(rawCoords);
  });

  public selectedPolygonCoordinates = this.massInclusionRepository.selectedPolygonCoordinates;
  public isSaving = signal(false);

  public massInclusionDataForm = this.formBuilder.group({
    occurrences: this.formBuilder.nonNullable.control<string[]>([]),
    variety: this.formBuilder.nonNullable.control<string>(''),
    lifeOfTree: this.formBuilder.nonNullable.control<string>('', [Validators.maxLength(80)]),
    plantingDate: this.formBuilder.nonNullable.control<string>(''),
    description: this.formBuilder.nonNullable.control<string>('', [Validators.maxLength(500)]),
  });

  public canEditForm = computed(() => this.selectedPolygonCoordinates().length >= 3);

  public get currentMassInclusionData(): MassInclusionData {
    return this.toMassInclusionData(this.massInclusionDataForm.getRawValue() as MassInclusionFormValue);
  }

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
    const data = this.massInclusionRepository.currentMassInclusionData();
    this.massInclusionDataForm.patchValue(data, { emitEvent: false });

    effect(() => {
      const isEnabled = this.canEditForm();
      if (isEnabled) {
        this.massInclusionDataForm.enable({ emitEvent: false });
      } else {
        this.massInclusionDataForm.disable({ emitEvent: false });
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

  public async loadRegions(): Promise<void> {
    this.isLoadingRegions.set(true);
    try {
      await this.regionsRepository.findAll();
    } finally {
      this.isLoadingRegions.set(false);
    }
  }

  public async onRegionChange(regionId: string | string[]): Promise<void> {
    const normalizedRegionId = this.toSingleValue(regionId);
    this.selectedRegionId.set(normalizedRegionId);
    const selectedRegion = this.findRegionById(normalizedRegionId);

    if (selectedRegion) {
      this.regionsRepository.currentRegion.set(selectedRegion);
      await this.loadPlantsForMap();
    } else {
      this.regionsRepository.currentRegion.set(null);
      this.plants.set([]);
    }
  }

  public findRegionById(regionId: string): Region | undefined {
    return this.uniqueRegions().find((region) => region.id === regionId);
  }

  public onOccurrencesChange(value: string | string[]): void {
    const nextOccurrences = Array.isArray(value) ? value : value ? [value] : [];
    this.massInclusionDataForm.controls.occurrences.setValue(nextOccurrences);
  }

  public onVarietyChange(value: string | string[]): void {
    this.massInclusionDataForm.controls.variety.setValue(Array.isArray(value) ? (value[0] ?? '') : value);
  }

  public onClearMassInclusionFormDataHandler(): void {
    this.massInclusionDataForm.reset(
      {
        occurrences: [],
        variety: '',
        lifeOfTree: '',
        plantingDate: '',
        description: '',
      },
      { emitEvent: false }
    );
  }

  private isValidPolygon(coordinates: PolygonCoordinate[]): boolean {
    if (coordinates.length < 3) {
      return false;
    }

    return coordinates.every((coordinate) => Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng));
  }

  private toMassInclusionData(value: MassInclusionFormValue): MassInclusionData {
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

  private async loadPlantsForMap(): Promise<void> {
    const selectedRegion = this.findRegionById(this.selectedRegionId());
    const region = selectedRegion?.region ?? '';
    if (!region) {
      this.plants.set([]);
      return;
    }

    const data = await this.plantsRepository.queryPlants({
      region,
      occurrence: '',
      variety: '',
    });
    this.plants.set(data);
  }

  private toSingleValue(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }

    return value;
  }

  public onSaveMassInclusionDataHandler(): void {
    if (!this.canEditForm()) return;

    this.massInclusionDataForm.markAllAsTouched();

    if (this.massInclusionDataForm.invalid) return;

    const massInclusionFormData = this.toMassInclusionData(this.massInclusionDataForm.getRawValue() as MassInclusionFormValue);

    this.massInclusionRepository.saveMassInclusionData(massInclusionFormData);

    const massInclusionInfo: MassInclusionInfo = {
      massInclusionData: massInclusionFormData,
      coordinates: this.selectedPolygonCoordinates()
    }

    console.log(massInclusionInfo);

  }
}
