import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { LanguageSwitcherComponent } from './language-switcher.component';

@NgModule({
  declarations: [LanguageSwitcherComponent],
  imports: [CommonModule, NzDropDownModule, NzMenuModule, NzIconModule],
  exports: [LanguageSwitcherComponent],
})
export class LanguageSwitcherModule {}
