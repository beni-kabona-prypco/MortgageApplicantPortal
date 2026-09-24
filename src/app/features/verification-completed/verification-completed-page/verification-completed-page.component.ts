import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-verification-completed-page',
  imports: [PageLayoutComponent, TopNavBuyerComponent],
  templateUrl: './verification-completed-page.component.html',
  styleUrl: './verification-completed-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationCompletedPageComponent {}
