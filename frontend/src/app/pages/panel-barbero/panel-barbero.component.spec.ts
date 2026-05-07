import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberoPanelComponent } from './panel-barbero.component';

describe('PanelBarbero', () => {
  let component: BarberoPanelComponent;
  let fixture: ComponentFixture<BarberoPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarberoPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarberoPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
