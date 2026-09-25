import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, TextComponent } from '@prypco/web-ui';

@Component({
  selector: 'app-bottom-sheet',
  imports: [ButtonComponent, TextComponent],
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly closeSheet = output<void>();

  protected handleClose(): void {
    this.closeSheet.emit();
  }
}
