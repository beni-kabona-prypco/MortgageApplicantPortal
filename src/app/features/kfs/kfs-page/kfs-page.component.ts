import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-kfs-page',
  imports: [PageLayoutComponent, TopNavBuyerComponent],
  templateUrl: './kfs-page.component.html',
  styleUrl: './kfs-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KfsPageComponent {}
