import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-time-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      Time
      <div class="alert alert-success">{{time}}</div>
    </div>
  `,
  styleUrl: './time-widget.component.css'
})
export class TimeWidgetComponent implements OnInit, OnDestroy {
  time = '';
  private intervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 500);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTime() {
    this.time = new Date().toLocaleTimeString();
  }
}
