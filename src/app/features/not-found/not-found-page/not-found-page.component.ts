import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TextComponent } from '@prypco/web-ui';

import { PageLayoutComponent } from '@shared/ui/page-layout';

@Component({
  selector: 'app-not-found-page',
  imports: [PageLayoutComponent, TextComponent],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent {}
