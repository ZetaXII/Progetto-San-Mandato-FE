import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAlert } from './popup-alert';

describe('PopupAlert', () => {
  let component: PopupAlert;
  let fixture: ComponentFixture<PopupAlert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupAlert]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAlert);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
