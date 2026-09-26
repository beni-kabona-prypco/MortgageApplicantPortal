import type { DropdownItem } from '@prypco/web-ui';

export function buildYearOptions(fromYear = 1970): readonly DropdownItem[] {
  const currentYear = new Date().getFullYear();
  const years: DropdownItem[] = [];

  for (let y = currentYear; y >= fromYear; y--) {
    years.push({ value: String(y), label: String(y) });
  }

  return years;
}
