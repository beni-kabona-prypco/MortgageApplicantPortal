import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TextComponent } from '@prypco/web-ui';

const MAX_MOBILE_BROKERAGE_LENGTH = 20;

@Component({
  selector: 'app-top-nav-buyer',
  standalone: true,
  imports: [TextComponent],
  templateUrl: './top-nav-buyer.component.html',
  styleUrl: './top-nav-buyer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavBuyerComponent {
  readonly brokerName = input.required<string>();
  readonly brokerageName = input.required<string>();
  readonly appId = input.required<string>();
  readonly brokerageLogo = input<string>('');
  readonly loading = input<boolean>(false);

  protected readonly brokerageNameMobile = computed(() => {
    const name = this.brokerageName();

    if (name.length <= MAX_MOBILE_BROKERAGE_LENGTH) {
      return name;
    }

    return name.slice(0, MAX_MOBILE_BROKERAGE_LENGTH).trimEnd() + '…';
  });
}
