import { TestBed } from '@angular/core/testing';

import { PanelPublicoService } from './panel-publico.service';

describe('PanelPublico', () => {
  let service: PanelPublicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelPublicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
