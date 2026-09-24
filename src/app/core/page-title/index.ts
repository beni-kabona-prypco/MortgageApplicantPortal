import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TitleStrategy } from '@angular/router';

import { PageTitleStrategy } from './page-title.strategy';

export function providePageTitle(): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: TitleStrategy, useClass: PageTitleStrategy }]);
}
