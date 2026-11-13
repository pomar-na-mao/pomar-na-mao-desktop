import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import type {
  ActivityCoordinate,
  ActivityGeometryType,
} from '../../../domain/models/activity-entry.model';
import { Input } from '../../../shared/components/input/input';
import {
  Select,
  type SelectOption,
} from '../../../shared/components/select/select';
import { ActivityEntryViewModel } from '../../view-models/activity-entry/activity-entry.view-model';
import { ActivityGeometryMap } from './components/activity-geometry-map';

@Component({
  selector: 'app-generate-activity',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    Input,
    Select,
    ActivityGeometryMap,
  ],
  templateUrl: './generate-activity.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [ActivityEntryViewModel],
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class GenerateActivity implements OnInit {
  public viewModel = inject(ActivityEntryViewModel);
  public activity = '';
  public responsible = '';
  public performedDate = localDate(new Date());
  public performedTime = localTime(new Date());
  public machineId = '';
  public mixtureId = '';

  public get machineOptions(): SelectOption[] {
    return [
      { label: 'Nenhuma máquina', value: '' },
      ...this.viewModel.machines().map((machine) => ({
        label: `${machine.name}${machine.brand ? ` — ${machine.brand}` : ''}`,
        value: machine.id,
      })),
    ];
  }

  public get mixtureOptions(): SelectOption[] {
    return [
      { label: 'Nenhuma calda', value: '' },
      ...this.viewModel.mixtures().map((mixture) => ({
        label: mixture.name,
        value: mixture.id,
      })),
    ];
  }

  public ngOnInit(): void {
    void this.viewModel.initialize();
  }

  public setGeometryType(type: ActivityGeometryType): void {
    this.viewModel.changeGeometryType(type);
  }

  public setCoordinates(coordinates: ActivityCoordinate[]): void {
    this.viewModel.setCoordinates(coordinates);
  }

  public async submit(form: NgForm): Promise<void> {
    form.control.markAllAsTouched();
    if (form.invalid) return;
    const performedAt = new Date(
      `${this.performedDate}T${this.performedTime}:00`,
    );
    if (Number.isNaN(performedAt.getTime())) return;

    const saved = await this.viewModel.submit({
      activity: this.activity,
      responsible: this.responsible,
      performedAt: performedAt.toISOString(),
      ...(this.machineId ? { machineId: this.machineId } : {}),
      ...(this.mixtureId ? { mixtureId: this.mixtureId } : {}),
    });
    if (!saved) return;
    form.resetForm();
    this.activity = '';
    this.responsible = '';
    this.machineId = '';
    this.mixtureId = '';
    this.performedDate = localDate(new Date());
    this.performedTime = localTime(new Date());
  }
}

function localDate(value: Date): string {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

function localTime(value: Date): string {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}
