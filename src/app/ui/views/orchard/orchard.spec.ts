import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Orchard } from './orchard';

describe('Orchard Component', () => {
  let fixture: ComponentFixture<Orchard>;
  let component: Orchard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orchard],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Orchard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render router outlet container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
