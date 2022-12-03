import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ExpenseComponent } from './expense/expense.component';

import { ResultRoutingModule } from './result-routing.module';
import { ResultComponent } from './result.component';
import { TotalComponent } from './total/total.component';

@NgModule({
  declarations: [ResultComponent, TotalComponent, ExpenseComponent],
  imports: [CommonModule, ResultRoutingModule, NzCollapseModule],
})
export class ResultModule {}
