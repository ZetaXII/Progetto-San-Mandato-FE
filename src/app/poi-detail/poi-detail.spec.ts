import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoiDetail } from './poi-detail';

describe('PoiDetail', () => {
  let component: PoiDetail;
  let fixture: ComponentFixture<PoiDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoiDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoiDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
