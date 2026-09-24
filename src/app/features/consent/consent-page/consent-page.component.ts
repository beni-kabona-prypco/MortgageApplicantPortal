import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-consent-page',
  imports: [PageLayoutComponent, TopNavBuyerComponent],
  templateUrl: './consent-page.component.html',
  styleUrl: './consent-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentPageComponent {}
