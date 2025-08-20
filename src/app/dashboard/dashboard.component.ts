import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';

import { StorageAdapter } from '../services/storage-adapter.service';
import { WidgetLoaderService } from '../services/widget-loader.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardStateService, DashboardState } from '../services/dashboard-state.service';
import { WidgetDefCollectionService } from '../services/widget-def-collection.service';
import { WidgetModelService } from '../services/widget-model.service';
import { Widget, WidgetDefinition } from '../models/widget.interface';
import { DashboardWidgetComponent } from '../widgets/dashboard-widget/dashboard-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DragDropModule, DashboardWidgetComponent],
  template: `
    <div class="dashboard">
      <div class="btn-toolbar">
        <div class="btn-group">
          <button *ngFor="let widgetDef of widgetDefinitions" 
                  (click)="addWidget(widgetDef)" 
                  type="button" 
                  class="btn btn-primary">
            {{widgetDef.name}}
          </button>
        </div>
        <button class="btn btn-warning" (click)="resetWidgetsToDefault()">Default Widgets</button>
        <button (click)="loadLegacyDashboard()" class="btn btn-info">Load Legacy Dashboard</button>
        <button (click)="clear()" type="button" class="btn btn-info">Clear</button>
        <button *ngIf="unsavedChanges > 0" 
                (click)="saveDashboard()" 
                class="btn btn-success">
          Save Changes ({{unsavedChanges}})
        </button>
      </div>

      <div cdkDropList 
           (cdkDropListDropped)="drop($event)" 
           class="dashboard-widget-area">
        <div *ngFor="let widget of widgets; trackBy: trackByWidget" 
             cdkDrag 
             class="widget-container"
             [ngStyle]="widget.containerStyle">
          <app-dashboard-widget 
            [widget]="widget"
            (widgetRemoved)="removeWidget($event)"
            (widgetChanged)="onWidgetChanged($event)"
            (widgetResized)="onWidgetResized($event)">
          </app-dashboard-widget>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  widgets: Widget[] = [];
  widgetDefinitions: WidgetDefinition[] = [];
  unsavedChanges = 0;
  
  private destroy$ = new Subject<void>();
  private dashboardState!: DashboardState;
  
  private storageAdapter = inject(StorageAdapter);
  private widgetLoader = inject(WidgetLoaderService);
  private dashboardService = inject(DashboardService);
  private dashboardStateService = inject(DashboardStateService);
  private widgetDefCollection = inject(WidgetDefCollectionService);
  private widgetModelService = inject(WidgetModelService);

  ngOnInit() {
    this.initializeDashboard();
    this.subscribeToChanges();
    this.loadWidgets();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDashboard() {
    this.widgetDefinitions = this.widgetLoader.getAllWidgetDefinitions();
    
    this.dashboardState = this.dashboardStateService.createState(
      localStorage,
      'angular_dashboard',
      'v1.0',
      this.widgetDefCollection,
      true
    );
  }

  private subscribeToChanges() {
    this.dashboardService.widgets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(widgets => {
        this.widgets = widgets;
      });

    this.dashboardService.unsavedChanges$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unsavedChanges = count;
      });
  }

  addWidget(widgetToInstantiate: WidgetDefinition | string) {
    let widgetDef: Record<string, unknown>;
    
    if (typeof widgetToInstantiate === 'string') {
      widgetDef = { name: widgetToInstantiate };
    } else {
      widgetDef = widgetToInstantiate as unknown as Record<string, unknown>;
    }

    const defaultWidgetDefinition = this.widgetLoader.getWidgetDefinition(widgetDef['name'] as string);
    if (!defaultWidgetDefinition) {
      console.error('Widget ' + widgetDef['name'] + ' is not found.');
      return;
    }

    if (!widgetDef['title'] && !defaultWidgetDefinition.title) {
      widgetDef['title'] = 'Widget ' + (this.widgets.length + 1);
    }

    const widget = this.widgetModelService.createWidget(defaultWidgetDefinition as unknown as Record<string, unknown>, widgetDef);
    this.dashboardService.addWidget(widget);
    this.saveDashboard();
  }

  removeWidget(widget: Widget) {
    this.dashboardService.removeWidget(widget);
    this.saveDashboard();
  }

  clear() {
    this.dashboardService.clearWidgets();
    this.saveDashboard();
  }

  resetWidgetsToDefault() {
    this.clear();
    this.addWidget('time');
  }

  loadLegacyDashboard() {
    const legacyWidgets = this.storageAdapter.loadFromStorage('demo_simple');
    if (legacyWidgets && legacyWidgets.length > 0) {
      this.dashboardService.updateWidgets(legacyWidgets);
      this.saveDashboard();
    } else {
      console.log('No legacy dashboard found');
    }
  }

  drop(event: CdkDragDrop<Widget[]>) {
    const widgets = [...this.widgets];
    moveItemInArray(widgets, event.previousIndex, event.currentIndex);
    this.dashboardService.updateWidgets(widgets);
    this.saveDashboard();
  }

  onWidgetChanged(widget: Widget) {
    this.dashboardService.widgetChanged(widget);
    this.saveDashboard();
  }

  onWidgetResized(event: {width?: number, height?: number, widthPixels?: number}) {
    console.log('Widget resized:', event);
  }

  saveDashboard() {
    const success = this.dashboardState.save(this.widgets);
    if (success) {
      this.dashboardService.resetUnsavedChanges();
    }
  }

  trackByWidget(index: number, widget: Widget): string {
    return widget.name + '_' + index;
  }

  private loadWidgets() {
    const savedWidgets = this.dashboardState.load();
    
    if (Array.isArray(savedWidgets)) {
      if (savedWidgets.length > 0) {
        this.dashboardService.updateWidgets(savedWidgets);
      } else {
        this.resetWidgetsToDefault();
      }
    } else if (savedWidgets && typeof savedWidgets === 'object' && 'then' in savedWidgets) {
      (savedWidgets as unknown as Promise<Widget[]>).then(
        (widgets: Widget[]) => {
          if (widgets && widgets.length > 0) {
            this.dashboardService.updateWidgets(widgets);
          } else {
            this.resetWidgetsToDefault();
          }
        },
        () => {
          this.resetWidgetsToDefault();
        }
      );
    } else {
      this.resetWidgetsToDefault();
    }
  }
}
