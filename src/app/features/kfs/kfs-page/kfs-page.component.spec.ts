import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KfsPageComponent } from './kfs-page.component';

describe('KfsPageComponent', () => {
  let component: KfsPageComponent;
  let fixture: ComponentFixture<KfsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KfsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KfsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
