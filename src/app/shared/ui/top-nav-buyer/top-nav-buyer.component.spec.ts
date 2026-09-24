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

  it('should render the brokerage name on mobile', () => {
    const el: HTMLElement = fixture.nativeElement;
    const mobileText = el.querySelector('prypco-text.top-nav__brokerage-mobile');

    expect(mobileText?.textContent?.trim()).toBe('Brokerage Name');
  });

  it('should render broker name in the desktop names block', () => {
    const el: HTMLElement = fixture.nativeElement;
    const desktopNames = el.querySelector('.top-nav__names-desktop');
    const brokerText = desktopNames?.querySelector('prypco-text:first-child');

    expect(brokerText?.textContent?.trim()).toBe('Broker Name');
  });

  it('should render the application ID badge', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.top-nav__id-badge')?.textContent?.trim()).toBe('ID #72381902');
  });

  it('should show the brokerage logo img when brokerageLogo is provided', () => {
    fixture.componentRef.setInput('brokerageLogo', 'https://cdn.example.com/logo.png');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const img = el.querySelector<HTMLImageElement>('img.top-nav__brokerage-logo');

    expect(img).toBeTruthy();
    expect(img?.src).toBe('https://cdn.example.com/logo.png');
  });

  it('should show the phone SVG fallback when no brokerageLogo is provided', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('img.top-nav__brokerage-logo')).toBeNull();
    expect(el.querySelector('svg.top-nav__phone-icon')).toBeTruthy();
  });
});
