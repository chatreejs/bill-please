import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  billName: string = '';

  get buttonDisabled(): boolean {
    return false;
  }

  constructor(private router: Router) {}

  next() {
    this.router.navigate(['bill']);
  }
}
