import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppToast } from './toast';
import { MessageService } from '../../../data/services/message/message.service';

describe('AppToast', () => {
  let fixture: ComponentFixture<AppToast>;
  let component: AppToast;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppToast],
      providers: [MessageService],
    }).compileComponents();

    fixture = TestBed.createComponent(AppToast);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display toast when showMessage is false', () => {
    messageService.showMessage.set(false);
    fixture.detectChanges();
    const alert = fixture.nativeElement.querySelector('aside');
    expect(alert).toBeFalsy();
  });

  it('should display success toast with emerald colors and check icon', () => {
    messageService.success('Operação realizada com sucesso!');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('aside');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Operação realizada com sucesso!');
    expect(alert.className).toContain('bg-emerald-50');
    expect(alert.className).toContain('border-emerald-300');
    expect(alert.className).toContain('text-emerald-900');

    const icon = fixture.nativeElement.querySelector('i.pi-check-circle');
    expect(icon).toBeTruthy();
    expect(icon.className).toContain('text-emerald-600');
  });

  it('should display error toast with rose colors and times icon', () => {
    messageService.error('Ocorreu um erro!');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('aside');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Ocorreu um erro!');
    expect(alert.className).toContain('bg-rose-50');
    expect(alert.className).toContain('text-rose-900');

    const icon = fixture.nativeElement.querySelector('i.pi-times-circle');
    expect(icon).toBeTruthy();
  });

  it('should display warn toast with amber colors and triangle icon', () => {
    messageService.warn('Atenção aos dados!');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('aside');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Atenção aos dados!');
    expect(alert.className).toContain('bg-amber-50');
    expect(alert.className).toContain('text-amber-900');

    const icon = fixture.nativeElement.querySelector('i.pi-exclamation-triangle');
    expect(icon).toBeTruthy();
  });

  it('should display info toast by default when type is info', () => {
    messageService.info('Informação geral');
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('aside');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Informação geral');
    expect(alert.className).toContain('bg-blue-50');

    const icon = fixture.nativeElement.querySelector('i.pi-info-circle');
    expect(icon).toBeTruthy();
  });

  it('should call messageService.hide when close button is clicked', () => {
    messageService.success('Test message');
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('button[aria-label="Fechar"]');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();

    expect(messageService.showMessage()).toBe(false);
  });
});
