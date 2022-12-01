import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent } from './pages/bill/bill.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ResultComponent } from './pages/result/result.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'bill', component: BillComponent },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
