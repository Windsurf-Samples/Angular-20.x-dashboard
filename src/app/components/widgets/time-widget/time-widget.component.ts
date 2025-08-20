import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-time-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="time-widget">
      <div class="widget-title">Time</div>
      <div class="alert alert-success">{{time}}</div>
    </div>
  `,
  styles: [`
    .time-widget {
      padding: 16px;
      height: 100%;
    }
    .widget-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .alert {
      padding: 12px;
      border-radius: 4px;
      margin: 0;
    }
    .alert-success {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
    }
  `]
})
export class TimeWidgetComponent implements OnInit, OnDestroy {
  time = '';
  private intervalSubscription?: Subscription;

  ngOnInit(): void {
    this.updateTime();
    this.intervalSubscription = interval(500).subscribe(() => {
      this.updateTime();
    });
  }

  ngOnDestroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  private updateTime(): void {
    this.time = new Date().toLocaleTimeString();
  }
}
