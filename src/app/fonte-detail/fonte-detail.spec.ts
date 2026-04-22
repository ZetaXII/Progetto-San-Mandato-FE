import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FonteDetail } from './fonte-detail';

describe('FonteDetail', () => {
  let component: FonteDetail;
  let fixture: ComponentFixture<FonteDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FonteDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FonteDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
