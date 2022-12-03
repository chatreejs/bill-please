import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ItemListComponent } from './item-list/item-list.component';
import { PayerListComponent } from './payer-list/payer-list.component';

@NgModule({
  declarations: [HomeComponent, ItemListComponent, PayerListComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,

    NzInputModule,
    NzTabsModule,
    NzButtonModule,
  ],
})
export class HomeModule {}
