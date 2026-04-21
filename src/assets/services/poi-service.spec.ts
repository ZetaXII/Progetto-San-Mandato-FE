import { TestBed } from '@angular/core/testing';

import { poiService } from './poi-service';

describe('poiService', () => {
  let service: poiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(poiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
