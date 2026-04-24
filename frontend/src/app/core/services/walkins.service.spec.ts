import { TestBed } from '@angular/core/testing';

import { WalkinsService } from './walkins.service';

describe('Walkins', () => {
  let service: WalkinsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WalkinsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
