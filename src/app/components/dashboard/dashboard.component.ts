import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { WidgetDefinition, WidgetInstance, DashboardOptions } from '../../models/widget-definition.interface';
import { DashboardStateService } from '../../services/dashboard-state.service';
import { RandomDataModelService } from '../../services/random-data-model.service';
import { TimeWidgetComponent } from '../widgets/time-widget/time-widget.component';
import { RandomWidgetComponent } from '../widgets/random-widget/random-widget.component';
import { FluidWidgetComponent } from '../widgets/fluid-widget/fluid-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    DragDropModule,
    TimeWidgetComponent,
    RandomWidgetComponent,
    FluidWidgetComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="btn-toolbar" *ngIf="!options.hideToolbar">
        <div class="btn-group" *ngIf="options.widgetButtons">
          <button 
            *ngFor="let widget of widgetDefinitions"
            (click)="addWidget(widget)" 
            mat-raised-button 
            color="primary"
            class="widget-add-btn">
            {{widget.name}}
          </button>
        </div>
        
        <button mat-raised-button color="warn" (click)="resetWidgetsToDefault()">
          Default Widgets
        </button>
        
        <button mat-raised-button color="accent" (click)="clear()">
          Clear
        </button>
      </div>

      <div 
        cdkDropList 
        (cdkDropListDropped)="drop($event)"
        class="dashboard-widget-area">
        <div 
          *ngFor="let widget of widgets; trackBy: trackByWidget"
          cdkDrag
          [ngStyle]="widget.containerStyle"
          class="widget-container">
          
          <div class="widget panel panel-default">
            <div class="widget-header panel-heading" cdkDragHandle>
              <h3 class="panel-title">
                <span class="widget-title" *ngIf="!widget.editingTitle" (dblclick)="editTitle(widget)">
                  {{widget.title}}
                </span>
                <form *ngIf="widget.editingTitle" (ngSubmit)="saveTitleEdit(widget)" class="widget-title-form">
                  <input 
                    type="text" 
                    [(ngModel)]="widget.title" 
                    (blur)="titleLostFocus(widget)"
                    class="form-control">
                </form>
                <span class="label label-primary" *ngIf="!options.hideWidgetName">{{widget.name}}</span>
              </h3>
              <div class="buttons">
                <button mat-icon-button (click)="removeWidget(widget)" *ngIf="!options.hideWidgetClose">
                  <mat-icon>close</mat-icon>
                </button>
                <button mat-icon-button (click)="toggleWidgetContent(widget)">
                  <mat-icon>{{widget.contentStyle?.['display'] === 'none' ? 'expand_more' : 'expand_less'}}</mat-icon>
                </button>
              </div>
            </div>
            
            <div class="panel-body widget-content" [ngStyle]="widget.contentStyle">
              <ng-container [ngSwitch]="widget.name">
                <app-time-widget *ngSwitchCase="'time'"></app-time-widget>
                <app-random-widget *ngSwitchCase="'random'" [value]="randomValue"></app-random-widget>
                <app-random-widget *ngSwitchCase="'datamodel'" [dataModel]="getDataModel(widget)"></app-random-widget>
                <app-fluid-widget *ngSwitchCase="'fluid'" [width]="widget.size?.width || '50%'" [height]="widget.size?.height || '250px'"></app-fluid-widget>
                <div *ngSwitchDefault>Unknown widget: {{widget.name}}</div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 16px;
    }
    
    .btn-toolbar {
      margin-bottom: 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .btn-group {
      display: flex;
      gap: 4px;
    }
    
    .widget-add-btn {
      margin-right: 4px;
    }
    
    .dashboard-widget-area {
      min-height: 400px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .widget-container {
      min-width: 300px;
      min-height: 200px;
      flex: 1 1 auto;
    }
    
    .widget {
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .widget-header {
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
    }
    
    .panel-title {
      margin: 0;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .widget-title {
      font-weight: 500;
    }
    
    .widget-title-form {
      display: inline-block;
    }
    
    .form-control {
      padding: 4px 8px;
      border: 1px solid #ccc;
      border-radius: 3px;
      font-size: 14px;
    }
    
    .label {
      background: #007bff;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 11px;
    }
    
    .buttons {
      display: flex;
      gap: 4px;
    }
    
    .widget-content {
      flex: 1;
      padding: 0;
      overflow: hidden;
    }
    
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    
    .cdk-drag-placeholder {
      opacity: 0;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .dashboard-widget-area.cdk-drop-list-dragging .widget-container:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class DashboardComponent implements OnInit {
  @Input() options: DashboardOptions = {};
  
  widgets: WidgetInstance[] = [];
  widgetDefinitions: WidgetDefinition[] = [];
  randomValue: number = Math.random();
  
  private count = 1;
  private dataModels = new Map<string, RandomDataModelService>();

  constructor(
    private dashboardState: DashboardStateService,
    private randomDataModelService: RandomDataModelService
  ) {
    setInterval(() => {
      this.randomValue = Math.random();
    }, 500);
  }

  ngOnInit(): void {
    this.widgetDefinitions = this.options.widgetDefinitions || [];
    
    this.dashboardState.init(
      this.options.storage || localStorage,
      this.options.storageId || 'demo_simple',
      this.options.storageHash,
      this.options.stringifyStorage !== false
    );

    const savedWidgets = this.dashboardState.load();
    if (savedWidgets && savedWidgets.length) {
      this.loadWidgets(savedWidgets);
    } else if (this.options.defaultWidgets) {
      this.loadWidgets(this.options.defaultWidgets);
    }
  }

  addWidget(widgetToInstantiate: WidgetDefinition | string, doNotSave = false): WidgetInstance {
    const widget = this.getWidget(widgetToInstantiate);
    this.widgets.push(widget);
    
    if (!doNotSave) {
      this.saveDashboard();
    }
    
    return widget;
  }

  prependWidget(widgetToInstantiate: WidgetDefinition | string, doNotSave = false): WidgetInstance {
    const widget = this.getWidget(widgetToInstantiate);
    this.widgets.unshift(widget);
    
    if (!doNotSave) {
      this.saveDashboard();
    }
    
    return widget;
  }

  removeWidget(widget: WidgetInstance): void {
    const index = this.widgets.indexOf(widget);
    if (index > -1) {
      this.widgets.splice(index, 1);
      this.saveDashboard();
    }
  }

  clear(): void {
    this.widgets = [];
    this.saveDashboard();
  }

  resetWidgetsToDefault(): void {
    if (this.options.defaultWidgets) {
      this.loadWidgets(this.options.defaultWidgets);
      this.saveDashboard();
    }
  }

  loadWidgets(widgets: WidgetInstance[]): void {
    this.clear();
    widgets.forEach(widgetDef => {
      this.addWidget(widgetDef, true);
    });
  }

  drop(event: CdkDragDrop<WidgetInstance[]>): void {
    moveItemInArray(this.widgets, event.previousIndex, event.currentIndex);
    this.saveDashboard();
  }

  editTitle(widget: WidgetInstance): void {
    widget.editingTitle = true;
  }

  saveTitleEdit(widget: WidgetInstance): void {
    widget.editingTitle = false;
    this.saveDashboard();
  }

  titleLostFocus(widget: WidgetInstance): void {
    widget.editingTitle = false;
    this.saveDashboard();
  }

  toggleWidgetContent(widget: WidgetInstance): void {
    if (!widget.contentStyle) {
      widget.contentStyle = {};
    }
    widget.contentStyle['display'] = widget.contentStyle['display'] === 'none' ? 'block' : 'none';
  }

  trackByWidget(index: number, widget: WidgetInstance): string {
    return `${widget.name}-${index}`;
  }

  getDataModel(widget: WidgetInstance): RandomDataModelService {
    const key = `${widget.name}-${this.widgets.indexOf(widget)}`;
    if (!this.dataModels.has(key)) {
      const dataModel = new RandomDataModelService();
      dataModel.setup(widget as unknown as Record<string, unknown>, { widgetData: 0 });
      dataModel.init();
      this.dataModels.set(key, dataModel);
    }
    return this.dataModels.get(key)!;
  }

  private getWidget(widgetToInstantiate: WidgetDefinition | string): WidgetInstance {
    let widgetDef: WidgetDefinition;
    
    if (typeof widgetToInstantiate === 'string') {
      widgetDef = { name: widgetToInstantiate };
    } else {
      widgetDef = { ...widgetToInstantiate };
    }

    const defaultWidgetDefinition = this.widgetDefinitions.find(def => def.name === widgetDef.name);
    if (!defaultWidgetDefinition) {
      throw new Error(`Widget ${widgetDef.name} is not found.`);
    }

    if (!widgetDef.title && !defaultWidgetDefinition.title) {
      widgetDef.title = 'Widget ' + this.count++;
    }

    const widget: WidgetInstance = {
      name: widgetDef.name,
      title: widgetDef.title || defaultWidgetDefinition.title || 'Widget',
      style: { ...defaultWidgetDefinition.style, ...widgetDef.style },
      size: { ...defaultWidgetDefinition.size, ...widgetDef.size },
      dataModelOptions: { ...defaultWidgetDefinition.dataModelOptions, ...widgetDef.dataModelOptions },
      attrs: { ...defaultWidgetDefinition.attrs, ...widgetDef.attrs },
      containerStyle: {},
      contentStyle: { display: 'block' },
      enableVerticalResize: true
    };

    if (widget.style) {
      widget.containerStyle = { ...widget.style };
    }

    return widget;
  }

  private saveDashboard(): void {
    if (!this.options.explicitSave) {
      this.dashboardState.save(this.widgets);
    }
  }
}
