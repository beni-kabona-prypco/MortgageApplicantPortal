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
  /** 'default' caps at 80vh; 'large' caps at 92vh — use for PDF/doc viewers. */
  readonly size = input<'default' | 'large'>('default');
  /** Set true to render the sticky footer slot (`[sheetFooter]`). */
  readonly hasFooter = input(false);
  /** Set true to remove padding from the sheet body — useful for full-bleed content like PDF viewers. */
  readonly noPadding = input(false);
  readonly closeSheet = output<void>();

  protected handleClose(): void {
    this.closeSheet.emit();
  }
}
