import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaComponent } from './reserva.component';

describe('Reserva', () => {
  let component: ReservaComponent;
  let fixture: ComponentFixture<ReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
