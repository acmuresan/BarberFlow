import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelVivoComponent } from './panel-vivo.component';

describe('PanelVivo', () => {
  let component: PanelVivoComponent;
  let fixture: ComponentFixture<PanelVivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelVivoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelVivoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
