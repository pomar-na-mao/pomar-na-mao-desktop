import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { mipdPlantPartLabel } from '../../../../domain/models/mipd.model';
import { MipdViewModel } from '../../../view-models/mipd/mipd.view-model';

@Component({
  selector: 'app-mipd-map-details-card',
  imports: [CommonModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  template: `
    @if (mipdViewModel.selectedMarking(); as marking) {
      <aside
        class="ui-surface-raised absolute top-3 bottom-3 right-3 z-[410] flex w-80 sm:w-[28rem] max-w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-xl transition-all"
        aria-label="Detalhes da marcação MIPD"
      >
        <div class="px-3.5 pt-4 pb-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0 flex items-center justify-between">
          <div>
            <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">
              Detalhes da Planta
            </h4>
            <p class="text-[10px] text-surface-500 dark:text-surface-400 leading-none">
              Marcação MIPD
            </p>
          </div>
          <p-button
            (onClick)="mipdViewModel.clearSelection()"
            icon="pi pi-times"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            size="small"
            ariaLabel="Fechar detalhes da planta"
          />
        </div>

        @if (mipdViewModel.selectedPlantMarkings().length > 1) {
          <div class="shrink-0 flex items-center justify-between px-3.5 py-1.5 border-b border-surface-200 dark:border-surface-800 bg-surface-100/50 dark:bg-surface-800/40">
            <p-button
              (onClick)="mipdViewModel.navigateMarking('prev')"
              [disabled]="mipdViewModel.currentMarkingIndex() === 0"
              icon="pi pi-chevron-left"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              size="small"
              ariaLabel="Marcação anterior"
            />
            <div class="flex flex-col items-center">
              <span class="text-[10px] text-surface-500 dark:text-surface-400 leading-tight">
                Marcações da Planta
              </span>
              <span class="text-xs font-semibold text-surface-900 dark:text-surface-100">
                {{ mipdViewModel.currentMarkingIndex() + 1 }} de {{ mipdViewModel.selectedPlantMarkings().length }}
              </span>
            </div>
            <p-button
              (onClick)="mipdViewModel.navigateMarking('next')"
              [disabled]="mipdViewModel.currentMarkingIndex() === mipdViewModel.selectedPlantMarkings().length - 1"
              icon="pi pi-chevron-right"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              size="small"
              ariaLabel="Próxima marcação"
            />
          </div>
        }

        <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <section class="rounded-xl border border-surface-200/80 dark:border-surface-800/80 bg-surface-50/50 dark:bg-surface-800/20 p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-qrcode text-surface-400 text-xs" aria-hidden="true"></i>
                <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Identificação</span>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60">
                <span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Praga ou doença
              </span>
            </div>

            <div class="rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200/70 dark:border-surface-800/70 px-3 py-2 shadow-xs">
              <span class="text-[9px] text-surface-400 dark:text-surface-500 font-medium block">ID da Planta</span>
              <span class="font-mono text-xs font-bold text-surface-900 dark:text-surface-0 break-all">
                {{ marking.plant_id }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-lg bg-surface-0/60 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex flex-col gap-1">
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-map-marker text-[11px] text-emerald-500" aria-hidden="true"></i>
                  <span class="font-medium text-surface-700 dark:text-surface-200">Zona</span>
                </div>
                <span class="font-semibold text-surface-900 dark:text-surface-0 truncate">
                  {{ marking.zone_name || 'Não informada' }}
                </span>
              </div>
              <div class="rounded-lg bg-surface-0/60 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex flex-col gap-1">
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-calendar text-[11px] text-blue-500" aria-hidden="true"></i>
                  <span class="font-medium text-surface-700 dark:text-surface-200">Data e Hora</span>
                </div>
                <span class="font-semibold text-surface-900 dark:text-surface-0 text-[11px]">
                  {{ formatDate(marking.observed_at) }}
                </span>
              </div>
              <div class="col-span-2 rounded-lg bg-surface-0/60 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-compass text-[11px] text-indigo-500" aria-hidden="true"></i>
                  <span class="font-medium text-surface-700 dark:text-surface-200">Coordenadas</span>
                </div>
                <span class="font-mono text-[11px] font-semibold text-surface-800 dark:text-surface-200 text-right">
                  {{ marking.latitude.toFixed(6) }}, {{ marking.longitude.toFixed(6) }}
                </span>
              </div>
            </div>
          </section>

          <section class="space-y-2.5">
            <div class="flex items-center gap-1.5">
              <i class="pi pi-exclamation-triangle text-red-500 text-xs" aria-hidden="true"></i>
              <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Praga ou doença</span>
            </div>
            <div class="rounded-xl border border-red-200/70 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 p-3 text-xs shadow-xs">
              <span class="font-semibold text-red-950 dark:text-red-100">
                {{ marking.occurrence_type_name }}
              </span>
            </div>
          </section>

          <section class="space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-tags text-surface-400 text-xs" aria-hidden="true"></i>
                <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Partes afetadas</span>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300">
                {{ marking.plant_parts.length }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              @for (part of marking.plant_parts; track part) {
                <span class="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                  <i class="pi pi-circle-fill text-[6px]" aria-hidden="true"></i>
                  {{ partLabel(part) }}
                </span>
              }
            </div>
          </section>

          <section class="space-y-2.5">
            <div class="flex items-center gap-1.5">
              <i class="pi pi-camera text-surface-400 text-xs" aria-hidden="true"></i>
              <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Foto da marcação</span>
            </div>
            @if (!marking.photo_object_path) {
              <div class="rounded-xl border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50/30 dark:bg-surface-800/20 p-5 text-center text-xs text-surface-500 dark:text-surface-400">
                <i class="pi pi-image block mb-1.5 text-base text-surface-400" aria-hidden="true"></i>
                Foto não informada.
              </div>
            } @else if (mipdViewModel.isPhotoLoading()) {
              <div class="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 p-5 text-center text-xs text-surface-500 dark:text-surface-400" role="status">
                <i class="pi pi-spinner pi-spin block mb-1.5 text-base text-primary" aria-hidden="true"></i>
                Carregando foto...
              </div>
            } @else if (mipdViewModel.photoError()) {
              <div class="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30 p-4 text-center text-xs text-red-700 dark:text-red-200" role="alert">
                <i class="pi pi-image block mb-1.5 text-base" aria-hidden="true"></i>
                {{ mipdViewModel.photoError() }}
              </div>
            } @else if (mipdViewModel.signedPhotoUrl()) {
              <img
                [src]="mipdViewModel.signedPhotoUrl()!"
                [alt]="'Foto da marcação de ' + marking.occurrence_type_name"
                class="block max-h-72 w-full rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100 dark:bg-surface-950 object-contain"
              />
            }
          </section>
        </div>

        <div class="p-3.5 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
          <p-button
            label="Fechar"
            icon="pi pi-times"
            severity="secondary"
            size="small"
            [outlined]="true"
            (onClick)="mipdViewModel.clearSelection()"
            styleClass="w-full"
          />
        </div>
      </aside>
    }
  `,
})
export class MipdMapDetailsCard {
  public mipdViewModel = inject(MipdViewModel);

  public partLabel = mipdPlantPartLabel;

  public formatDate(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
