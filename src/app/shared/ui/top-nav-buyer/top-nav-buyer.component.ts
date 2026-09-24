import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TextComponent } from '@prypco/web-ui';

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
}
