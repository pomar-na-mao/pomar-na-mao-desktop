import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Zones } from './zones';

describe('Zones Component', () => {
  let fixture: ComponentFixture<Zones>;
  let component: Zones;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Zones],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Zones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render router outlet container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const outlet = compiled.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
