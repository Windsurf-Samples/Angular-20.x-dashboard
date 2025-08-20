import { Component, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageAdapter } from '../services/storage-adapter.service';
import { WidgetLoaderService } from '../services/widget-loader.service';
import { Widget } from '../models/widget.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <h2>Hybrid Dashboard</h2>
      <button (click)="addTimeWidget()">Add Time Widget</button>
      <button (click)="loadLegacyDashboard()">Load Legacy Dashboard</button>
      <div class="widgets-container">
        <div #widgetContainer></div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @ViewChild('widgetContainer', { read: ViewContainerRef }) 
  widgetContainer!: ViewContainerRef;
  
  widgets: Widget[] = [];
  
  private storageAdapter = inject(StorageAdapter);
  private widgetLoader = inject(WidgetLoaderService);

  ngOnInit() {
    this.loadWidgets();
  }

  addTimeWidget() {
    const timeWidget: Widget = {
      title: 'Angular Time Widget',
      name: 'time',
      style: {},
      size: { width: '33%' },
      framework: 'angular'
    };
    this.widgets.push(timeWidget);
    this.renderWidget(timeWidget);
    this.saveWidgets();
  }

  loadLegacyDashboard() {
    const legacyWidgets = this.storageAdapter.loadFromStorage('demo_simple');
    if (legacyWidgets) {
      this.widgets = legacyWidgets;
      this.renderAllWidgets();
    }
  }

  private loadWidgets() {
    const stored = this.storageAdapter.loadFromStorage('angular_dashboard');
    if (stored) {
      this.widgets = stored;
      this.renderAllWidgets();
    }
  }

  private renderAllWidgets() {
    this.widgetContainer.clear();
    this.widgets.forEach(widget => this.renderWidget(widget));
  }

  private renderWidget(widget: Widget) {
    this.widgetLoader.loadWidget(widget, this.widgetContainer);
  }

  private saveWidgets() {
    this.storageAdapter.saveToStorage('angular_dashboard', this.widgets);
  }
}
