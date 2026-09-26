import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, TextComponent } from '@prypco/web-ui';

import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-get-started-mobile',
  imports: [TopNavBuyerComponent, TextComponent, ButtonComponent],
  templateUrl: './get-started-mobile.component.html',
  styleUrl: './get-started-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetStartedMobileComponent {
  readonly applicationId = input.required<string>();
  readonly buyerFirstName = input.required<string>();
  readonly brokerName = input.required<string>();
  readonly brokerageName = input.required<string>();
  readonly shortId = input<string>('');
  readonly brokerageLogo = input<string>('');

  // Resume mode: consent was already accepted on a previous visit
  readonly isResume = input<boolean>(false);
  // Which resume steps are already done (only meaningful when isResume is true)
  readonly isInfoProvided = input<boolean>(false);
  readonly isEkycCompleted = input<boolean>(false);

  readonly ctaClick = output<void>();
}
