import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Variety } from '../../../../domain/models/variety.model';
import { Input as AppInput } from '../../../../shared/components/input/input';
import { Textarea as AppTextarea } from '../../../../shared/components/textarea/textarea';

export interface VarietyFormValue {
  name: string;
  description: string | null;
}

@Component({
  selector: 'app-variety-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppInput, AppTextarea],
  template: `
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
      (click)="onBackdropClick($event)"
      id="modal-backdrop"
    >
      <div 
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0 transition-colors">
          <div>
            <h2 class="text-lg font-bold text-slate-800 dark:text-white transition-colors">
              {{ variety ? 'Editar Variedade' : 'Nova Variedade' }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 transition-colors">Preencha os campos abaixo para salvar a variedade.</p>
          </div>
          <button 
            (click)="close()"
            class="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <form [formGroup]="varietyForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <app-input
              label="Nome da Variedade"
              placeholder="Ex: Valencia, Pera Rio"
              formControlName="name"
            />

            <app-textarea
              label="Descrição"
              placeholder="Detalhes sobre a variedade..."
              formControlName="description"
              [rows]="4"
            />
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end gap-3 flex-shrink-0 transition-colors">
          <button 
            type="button"
            (click)="close()"
            class="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
          >
            Cancelar
          </button>
          <button 
            type="button"
            (click)="onSubmit()"
            [disabled]="varietyForm.invalid || isSaving"
            class="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            @if (isSaving) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Salvando...
            } @else {
              Salvar Alterações
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class VarietyFormModal implements OnChanges {
  @Input() public variety: Variety | null = null;
  @Input() public isSaving = false;
  @Output() public closed = new EventEmitter<void>();
  @Output() public submitted = new EventEmitter<VarietyFormValue>();

  private formBuilder = inject(FormBuilder);

  public varietyForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(500)]],
  });

  public ngOnChanges(changes: SimpleChanges): void {
    if ('variety' in changes) {
      this.varietyForm.reset({
        name: this.variety?.name ?? '',
        description: this.variety?.description ?? '',
      });
    }
  }

  @HostListener('document:keydown.escape')
  public onEscapeKey(): void {
    this.close();
  }

  public close(): void {
    if (this.isSaving) return;
    this.closed.emit();
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).id === 'modal-backdrop') {
      this.close();
    }
  }

  public onSubmit(): void {
    this.varietyForm.markAllAsTouched();

    if (this.varietyForm.invalid) return;

    const value = this.varietyForm.getRawValue();

    this.submitted.emit({
      name: value.name.trim(),
      description: this.normalizeOptionalText(value.description),
    });
  }

  private normalizeOptionalText(value: string | null): string | null {
    if (!value) return null;
    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : null;
  }
}
