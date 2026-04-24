import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelBarberoComponent } from './panel-barbero.component';

describe('PanelBarbero', () => {
  let component: PanelBarberoComponent;
  let fixture: ComponentFixture<PanelBarberoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelBarberoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelBarberoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
