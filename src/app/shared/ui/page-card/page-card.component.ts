import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-card',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './page-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCardComponent {}
