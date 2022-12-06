import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { FooterComponent } from './components/footer/footer.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';

@NgModule({
  declarations: [FooterComponent, LanguageSwitcherComponent],
  imports: [CommonModule, NzDropDownModule, NzMenuModule, NzIconModule],
  exports: [CommonModule, LanguageSwitcherComponent, FooterComponent],
  providers: [],
})
export class SharedModule {}
