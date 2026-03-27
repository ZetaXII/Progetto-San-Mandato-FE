import { TestBed } from '@angular/core/testing';

import { _poiService } from './poi-service';

describe('_poiService', () => {
  let service: _poiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(_poiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
