import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelPublicoComponent } from './panel-publico.component';

describe('PanelPublico', () => {
  let component: PanelPublicoComponent;
  let fixture: ComponentFixture<PanelPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelPublicoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelPublicoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
