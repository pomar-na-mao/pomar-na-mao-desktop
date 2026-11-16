import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  ClientId,
  TENANT_CATALOG,
  isClientId,
} from '../../../../environments/client-config';
import { TenantSwitchService } from '../../../data/services/tenant-switch/tenant-switch.service';
import { Select, SelectOption } from '../../../shared/components/select/select';

@Component({
  selector: 'app-tenant-switcher',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    Select,
  ],
  template: `
    <section
      class="mx-2 mb-2 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-surface-0 p-3 shadow-sm transition-colors duration-200 dark:border-emerald-900/70 dark:from-emerald-950/40 dark:to-surface-900"
      aria-labelledby="tenant-switcher-title"
    >
      <div class="mb-3 flex items-start gap-2.5">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300"
          aria-hidden="true"
        >
          <i class="pi pi-building text-sm"></i>
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div
              id="tenant-switcher-title"
              class="truncate text-xs font-semibold leading-4 text-surface-900 dark:text-surface-0"
            >
              Área administrativa
            </div>
            <span
              class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[0.5rem] font-bold tracking-wide text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300"
            >
              ADMIN
            </span>
          </div>
          <div
            class="mt-0.5 text-[0.625rem] leading-3.5 text-surface-600 dark:text-surface-400"
          >
            Alterar cliente ativo
          </div>
        </div>
      </div>

      <app-select
        id="tenant-selector"
        placeholder="Selecione o cliente..."
        [options]="tenantOptions"
        [value]="tenantSwitch.activeClientId()"
        (valueChange)="onTenantIdSelected($event)"
        [disabled]="tenantSwitch.busy()"
      />

      <p
        class="py-2 flex items-start gap-1.5 text-[0.6875rem] leading-4 text-surface-500 dark:text-surface-400"
      >
        <i class="pi pi-lock mt-0.5 text-[0.625rem]" aria-hidden="true"></i>
        Uma nova autenticação será solicitada ao trocar de cliente.
      </p>
    </section>

    @if (targetClientId; as targetId) {
      <p-dialog
        [visible]="true"
        (visibleChange)="onDialogVisibilityChange($event)"
        (onShow)="focusEmail()"
        [header]="'Acessar ' + tenantAlias(targetId)"
        [modal]="true"
        [closable]="!tenantSwitch.busy()"
        [closeOnEscape]="!tenantSwitch.busy()"
        [dismissableMask]="!tenantSwitch.busy()"
        [style]="{ width: 'min(28rem, calc(100vw - 2rem))' }"
      >
        <div
          class="mb-5 flex gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 dark:border-surface-700 dark:bg-surface-800/60"
        >
          <i class="pi pi-shield mt-0.5 text-primary" aria-hidden="true"></i>
          <p class="text-sm leading-5 text-surface-600 dark:text-surface-300">
            Confirme uma conta administradora de
            <strong class="font-semibold text-surface-900 dark:text-surface-0">
              {{ tenantAlias(targetId) }} </strong
            >. O cliente atual permanece ativo até a validação terminar.
          </p>
        </div>

        <form class="flex flex-col gap-4" (ngSubmit)="submit()">
          <div>
            <label
              for="tenant-email"
              class="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-200"
            >
              E-mail
            </label>
            <input
              #emailInput
              id="tenant-email"
              pInputText
              name="tenantEmail"
              type="email"
              autocomplete="username"
              class="w-full"
              [(ngModel)]="email"
              [disabled]="tenantSwitch.busy()"
              required
            />
          </div>

          <div>
            <label
              for="tenant-password"
              class="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-200"
            >
              Senha
            </label>
            <input
              id="tenant-password"
              pInputText
              name="tenantPassword"
              type="password"
              autocomplete="current-password"
              class="w-full"
              [(ngModel)]="password"
              [disabled]="tenantSwitch.busy()"
              required
            />
          </div>

          @if (tenantSwitch.errorMessage(); as errorMessage) {
            <div
              class="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              <i class="pi pi-exclamation-circle mt-0.5" aria-hidden="true"></i>
              <span>{{ errorMessage }}</span>
            </div>
          }

          <div
            class="flex justify-end gap-2 border-t border-surface-200 pt-4 dark:border-surface-700"
          >
            <p-button
              type="button"
              label="Cancelar"
              severity="secondary"
              size="small"
              [outlined]="true"
              [disabled]="tenantSwitch.busy()"
              (onClick)="cancel()"
            />
            <p-button
              type="submit"
              label="Entrar e trocar"
              icon="pi pi-arrow-right-arrow-left"
              size="small"
              [loading]="tenantSwitch.busy()"
              [disabled]="tenantSwitch.busy() || !email || !password"
            />
          </div>
        </form>
      </p-dialog>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class TenantSwitcher {
  @ViewChild('emailInput') private emailInput?: ElementRef<HTMLInputElement>;

  public readonly tenantSwitch = inject(TenantSwitchService);
  public readonly tenants = TENANT_CATALOG;
  public readonly tenantOptions: SelectOption[] = TENANT_CATALOG.map(
    (tenant) => ({
      label: tenant.alias,
      value: tenant.id,
    }),
  );
  public targetClientId: ClientId | null = null;
  public email = '';
  public password = '';

  public onTenantIdSelected(value: unknown): void {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    if (
      !isClientId(selectedValue) ||
      selectedValue === this.tenantSwitch.activeClientId()
    ) {
      return;
    }

    this.tenantSwitch.cancel();
    this.targetClientId = selectedValue;
  }

  public async submit(): Promise<void> {
    if (!this.targetClientId || !this.email || !this.password) {
      return;
    }

    const password = this.password;
    this.password = '';
    const result = await this.tenantSwitch.switchTenant(
      this.targetClientId,
      this.email.trim(),
      password,
    );

    if (!result.ok) {
      setTimeout(() => this.focusEmail());
    }
  }

  public cancel(): void {
    if (this.tenantSwitch.busy()) {
      return;
    }
    this.email = '';
    this.password = '';
    this.targetClientId = null;
    this.tenantSwitch.cancel();
  }

  public onDialogVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.cancel();
    }
  }

  public focusEmail(): void {
    setTimeout(() => this.emailInput?.nativeElement.focus());
  }

  public tenantAlias(clientId: ClientId): string {
    return (
      this.tenants.find((tenant) => tenant.id === clientId)?.alias ?? clientId
    );
  }
}
