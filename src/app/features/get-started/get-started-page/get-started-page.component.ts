import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TextComponent } from '@prypco/web-ui';
import { QRCodeComponent } from 'angularx-qrcode';
import { map } from 'rxjs/operators';

import { PageCardComponent } from '@shared/ui/page-card';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-get-started-page',
  imports: [
    PageLayoutComponent,
    TopNavBuyerComponent,
    PageCardComponent,
    QRCodeComponent,
    TextComponent,
  ],
  templateUrl: './get-started-page.component.html',
  styleUrl: './get-started-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetStartedPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly applicationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('applicationId') ?? '')),
    { initialValue: '' },
  );

  protected readonly qrCodeUrl = computed(
    () => `${window.location.origin}/consent/${this.applicationId()}`,
  );

  // placeholder — replaced with application API data
  protected readonly buyerFirstName = 'Mohammed';
}
