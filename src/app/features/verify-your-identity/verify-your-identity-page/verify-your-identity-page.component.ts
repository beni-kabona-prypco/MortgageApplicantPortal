import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-verify-your-identity-page',
  imports: [PageLayoutComponent, TopNavBuyerComponent],
  templateUrl: './verify-your-identity-page.component.html',
  styleUrl: './verify-your-identity-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyYourIdentityPageComponent {}
