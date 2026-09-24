import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopNavBuyerComponent } from './top-nav-buyer.component';

describe('TopNavBuyerComponent', () => {
  let component: TopNavBuyerComponent;
  let fixture: ComponentFixture<TopNavBuyerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNavBuyerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopNavBuyerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('brokerName', 'Broker Name');
    fixture.componentRef.setInput('brokerageName', 'Brokerage Name');
    fixture.componentRef.setInput('appId', '72381902');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render broker and brokerage names', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.top-nav__broker-name')?.textContent?.trim()).toBe('Broker Name');
    expect(el.querySelector('.top-nav__brokerage-name')?.textContent?.trim()).toBe('Brokerage Name');
  });

  it('should render the application ID badge', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.top-nav__id-badge')?.textContent?.trim()).toBe('ID #72381902');
  });
});
