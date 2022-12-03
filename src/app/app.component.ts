import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private currentUrl: string = '/';

  get showBackButton(): boolean {
    return this.currentUrl !== '/';
  }

  constructor(private router: Router, private location: Location) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
      }
    });
  }

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }
}
