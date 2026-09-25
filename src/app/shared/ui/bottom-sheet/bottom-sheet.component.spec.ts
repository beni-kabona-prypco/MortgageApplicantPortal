import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSheetComponent } from './bottom-sheet.component';

describe('BottomSheetComponent', () => {
  let component: BottomSheetComponent;
  let fixture: ComponentFixture<BottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the panel when closed', () => {
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.bottom-sheet__panel')).toBeNull();
  });

  it('should render the panel and title when open', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.bottom-sheet__panel')).toBeTruthy();
    expect(el.querySelector('.bottom-sheet__header')?.textContent).toContain('Test Title');
  });

  it('should emit closeSheet when backdrop is clicked', () => {
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const closeEmitSpy = jasmine.createSpy('closeSheet');
    component.closeSheet.subscribe(closeEmitSpy);

    const el: HTMLElement = fixture.nativeElement;
    (el.querySelector('.bottom-sheet__backdrop') as HTMLElement)?.click();

    expect(closeEmitSpy).toHaveBeenCalled();
  });
});
