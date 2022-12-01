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
import { LandingComponent } from './pages/landing/landing.component';
import { ResultComponent } from './pages/result/result.component';
import { TotalComponent } from './pages/result/total/total.component';
import { FooterModule } from './shared';

import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ExpenseComponent } from './pages/result/expense/expense.component';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    BillComponent,
    ResultComponent,
    TotalComponent,
    ExpenseComponent,
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
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
