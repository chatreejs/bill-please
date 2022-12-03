import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BillComponent } from './pages/bill/bill.component';
import { HomeComponent } from './pages/home/home.component';
import { ItemListComponent } from './pages/home/item-list/item-list.component';
import { PayerListComponent } from './pages/home/payer-list/payer-list.component';
import { ExpenseComponent } from './pages/result/expense/expense.component';
import { ResultComponent } from './pages/result/result.component';
import { TotalComponent } from './pages/result/total/total.component';
import { FooterModule } from './shared';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BillComponent,
    ResultComponent,
    TotalComponent,
    ExpenseComponent,
    ItemListComponent,
    PayerListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,

    FooterModule,

    NzIconModule,
    NzCollapseModule,
    NzTabsModule,
    NzButtonModule,
    NzInputModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
