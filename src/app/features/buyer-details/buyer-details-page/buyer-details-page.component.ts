import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-buyer-details-page',
  imports: [PageLayoutComponent, TopNavBuyerComponent],
  templateUrl: './buyer-details-page.component.html',
  styleUrl: './buyer-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDetailsPageComponent {}
