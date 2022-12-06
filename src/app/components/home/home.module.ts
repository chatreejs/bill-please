import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ItemListModalComponent } from './item-list/item-list-modal/item-list-modal.component';
import { ItemListComponent } from './item-list/item-list.component';
import { PayerListModalComponent } from './payer-list/payer-list-modal/payer-list-modal.component';
import { PayerListComponent } from './payer-list/payer-list.component';

@NgModule({
  declarations: [
    HomeComponent,
    ItemListComponent,
    PayerListComponent,
    ItemListModalComponent,
    PayerListModalComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    NzIconModule,
    NzInputModule,
    NzTabsModule,
    NzButtonModule,
    NzModalModule,
    NzTableModule,
    NzDividerModule,
    NzFormModule,
    NzPopconfirmModule,
    NzTagModule,
    NzCheckboxModule,
    NzCardModule,
    NzGridModule,
  ],
})
export class HomeModule {}
