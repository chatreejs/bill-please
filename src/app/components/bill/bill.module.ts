import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { BillRoutingModule } from './bill-routing.module';
import { BillComponent } from './bill.component';

@NgModule({
  declarations: [BillComponent],
  imports: [CommonModule, BillRoutingModule],
})
export class BillModule {}
