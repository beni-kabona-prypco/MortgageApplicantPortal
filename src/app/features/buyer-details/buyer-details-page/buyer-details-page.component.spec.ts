import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuyerDetailsPageComponent } from './buyer-details-page.component';

describe('BuyerDetailsPageComponent', () => {
  let component: BuyerDetailsPageComponent;
  let fixture: ComponentFixture<BuyerDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyerDetailsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BuyerDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
