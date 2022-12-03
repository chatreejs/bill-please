import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss'],
})
export class BillComponent {
  constructor(private router: Router) {}
  next() {
    this.router.navigate(['result']);
  }
}
