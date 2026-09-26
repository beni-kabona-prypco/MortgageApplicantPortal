import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent, TextComponent } from '@prypco/web-ui';

import { BROKER_HUB_URL } from '../home.constants';

@Component({
  selector: 'app-home-page',
  imports: [TextComponent, ButtonComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  protected readonly brokerHubUrl = BROKER_HUB_URL;

  protected goToBrokerPortal(): void {
    window.location.href = this.brokerHubUrl;
  }
}
