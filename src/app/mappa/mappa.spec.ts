import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mappa } from './mappa';

describe('Mappa', () => {
  let component: Mappa;
  let fixture: ComponentFixture<Mappa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mappa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Mappa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
