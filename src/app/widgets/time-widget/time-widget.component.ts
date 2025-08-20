import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-time-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-widget angular-widget">
      <h4>Angular Time</h4>
      <div class="time-display">
        {{ currentTime | date:'medium' }}
      </div>
    </div>
  `,
  styles: [`
    .time-widget {
      padding: 16px;
      text-align: center;
    }
    .time-display {
      font-size: 1.2em;
      font-weight: bold;
      color: #1976d2;
    }
    .angular-widget {
      border: 2px solid #1976d2;
      border-radius: 4px;
      background-color: #f5f5f5;
    }
  `]
})
export class TimeWidgetComponent implements OnInit, OnDestroy {
  currentTime = new Date();
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
