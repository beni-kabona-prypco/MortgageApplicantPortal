import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificationCompletedPageComponent } from './verification-completed-page.component';

describe('VerificationCompletedPageComponent', () => {
  let component: VerificationCompletedPageComponent;
  let fixture: ComponentFixture<VerificationCompletedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationCompletedPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationCompletedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
