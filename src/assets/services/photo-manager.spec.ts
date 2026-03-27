import { TestBed } from '@angular/core/testing';

import { PhotoManager } from './photo-manager';

describe('PhotoManager', () => {
  let service: PhotoManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
