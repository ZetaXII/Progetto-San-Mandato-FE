import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPoi } from './card-poi';

describe('CardPoi', () => {
  let component: CardPoi;
  let fixture: ComponentFixture<CardPoi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPoi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPoi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
