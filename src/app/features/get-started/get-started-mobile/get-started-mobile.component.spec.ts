import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetStartedMobileComponent } from './get-started-mobile.component';

describe('GetStartedMobileComponent', () => {
  let fixture: ComponentFixture<GetStartedMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetStartedMobileComponent],
    })
      .overrideComponent(GetStartedMobileComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GetStartedMobileComponent);
    fixture.componentRef.setInput('applicationId', 'app-123');
    fixture.componentRef.setInput('buyerFirstName', 'Sara');
    fixture.componentRef.setInput('brokerName', 'Agent A');
    fixture.componentRef.setInput('brokerageName', 'Brokerage A');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
