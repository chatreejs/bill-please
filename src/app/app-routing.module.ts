import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent } from './pages/bill/bill.component';
import { HomeComponent } from './pages/home/home.component';
import { ResultComponent } from './pages/result/result.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'bill', component: BillComponent },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
