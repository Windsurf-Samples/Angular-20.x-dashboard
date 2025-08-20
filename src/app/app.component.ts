import { Component } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  imports: [DashboardComponent],
  template: `
    <div class="app">
      <h1>Angular 20.x Dashboard Migration</h1>
      <app-dashboard></app-dashboard>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-dashboard';
}
