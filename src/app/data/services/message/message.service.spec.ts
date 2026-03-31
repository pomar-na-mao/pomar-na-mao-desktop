import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        MessageService,
        {
          provide: TranslateService,
          useValue: {
            instant: vi.fn((key: string) => `translated:${key}`)
          }
        }
      ]
    });

    service = TestBed.inject(MessageService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('show should store the translated message and make it visible', () => {
    service.show('COMMON.TOAST.SUCCESS', 'success');

    expect(service.currentMessage()).toEqual({
      text: 'translated:COMMON.TOAST.SUCCESS',
      type: 'success'
    });
    expect(service.showMessage()).toBe(true);
  });

  it('show should auto hide the toast after five seconds', () => {
    service.show('COMMON.TOAST.SUCCESS');

    vi.advanceTimersByTime(5000);

    expect(service.showMessage()).toBe(false);
  });

  it('helper methods should delegate to show with the matching type', () => {
    const showSpy = vi.spyOn(service, 'show');

    service.success('A');
    service.error('B');
    service.warn('C');
    service.info('D');

    expect(showSpy).toHaveBeenNthCalledWith(1, 'A', 'success');
    expect(showSpy).toHaveBeenNthCalledWith(2, 'B', 'error');
    expect(showSpy).toHaveBeenNthCalledWith(3, 'C', 'warn');
    expect(showSpy).toHaveBeenNthCalledWith(4, 'D', 'info');
  });
});
