import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TextComponent } from '@prypco/web-ui';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [TextComponent],
  templateUrl: './page-layout.component.html',
  styleUrl: './page-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutComponent {
  readonly centered = input(false);
}
