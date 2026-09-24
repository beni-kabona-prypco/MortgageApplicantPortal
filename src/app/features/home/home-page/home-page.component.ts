import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

@Component({
  selector: 'app-home-page',
  imports: [PageLayoutComponent, TopNavBuyerComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
