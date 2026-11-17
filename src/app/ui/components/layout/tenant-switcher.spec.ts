import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TenantSwitchService } from '../../../data/services/tenant-switch/tenant-switch.service';
import { Select } from '../../../shared/components/select/select';
import { TenantSwitcher } from './tenant-switcher';

describe('TenantSwitcher', () => {
  let fixture: ComponentFixture<TenantSwitcher>;
  let component: TenantSwitcher;
  const switchTenant = vi.fn();
  const cancel = vi.fn();
  const activeClientId = signal<'ricardoAbacate' | 'hassAvocado'>('ricardoAbacate');
  const busy = signal(false);
  const errorMessage = signal<string | null>(null);

  beforeEach(async () => {
    vi.clearAllMocks();
    activeClientId.set('ricardoAbacate');
    busy.set(false);
    errorMessage.set(null);
    await TestBed.configureTestingModule({
      imports: [TenantSwitcher],
      providers: [
        {
          provide: TenantSwitchService,
          useValue: { activeClientId, busy, errorMessage, switchTenant, cancel },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(TenantSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders all aliases with the active tenant selected', () => {
    const select = fixture.debugElement.query(By.directive(Select)).componentInstance as Select;

    expect(select.options).toEqual([
      { label: 'Ricardo Lichia', value: 'ricardoLichia' },
      { label: 'Hass Avocado', value: 'hassAvocado' },
      { label: 'Ricardo Abacate', value: 'ricardoAbacate' },
    ]);
    expect(select.value).toBe('ricardoAbacate');
    expect(select.label).toBe('');
    expect(select.placeholder).toBe('Selecione o cliente...');
    expect(select.size).toBe('md');
    expect(fixture.nativeElement.textContent).toContain('Área administrativa');
    const title = fixture.nativeElement.querySelector('#tenant-switcher-title');
    expect(title.tagName).toBe('DIV');
    expect(title.classList.contains('text-xs')).toBe(true);
  });

  it('does not open the modal or authenticate for the active tenant', () => {
    component.onTenantIdSelected('ricardoAbacate');

    expect(component.targetClientId).toBeNull();
    expect(switchTenant).not.toHaveBeenCalled();
  });

  it('opens an accessible modal naming a different target', () => {
    component.onTenantIdSelected('hassAvocado');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.p-dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain('Hass Avocado');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.querySelector('label[for="tenant-email"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('label[for="tenant-password"]')).toBeTruthy();
  });

  it('submits credentials, immediately clears the password, and retains committed selection on failure', async () => {
    switchTenant.mockResolvedValue({ ok: false, reason: 'authentication-failed' });
    component.targetClientId = 'hassAvocado';
    component.email = ' admin@example.com ';
    component.password = 'secret';

    await component.submit();

    expect(switchTenant).toHaveBeenCalledWith('hassAvocado', 'admin@example.com', 'secret');
    expect(component.password).toBe('');
    expect(component.targetClientId).toBe('hassAvocado');
  });

  it('cancels the modal and discards credentials', () => {
    component.targetClientId = 'hassAvocado';
    component.email = 'admin@example.com';
    component.password = 'secret';

    component.cancel();

    expect(component.targetClientId).toBeNull();
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(cancel).toHaveBeenCalled();
  });

  it('disables controls while authentication is busy', async () => {
    busy.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.directive(Select)).componentInstance as Select;
    expect(select.disabled).toBe(true);
  });
});
