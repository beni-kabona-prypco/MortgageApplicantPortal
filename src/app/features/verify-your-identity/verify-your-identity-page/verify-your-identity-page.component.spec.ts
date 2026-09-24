import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyYourIdentityPageComponent } from './verify-your-identity-page.component';

describe('VerifyYourIdentityPageComponent', () => {
  let component: VerifyYourIdentityPageComponent;
  let fixture: ComponentFixture<VerifyYourIdentityPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyYourIdentityPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyYourIdentityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
