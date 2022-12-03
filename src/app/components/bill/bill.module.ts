import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { BillRoutingModule } from './bill-routing.module';
import { BillComponent } from './bill.component';

@NgModule({
  declarations: [BillComponent],
  imports: [CommonModule, BillRoutingModule, NzButtonModule],
})
export class BillModule {}
