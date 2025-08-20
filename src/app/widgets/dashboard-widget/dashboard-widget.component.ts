import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ViewContainerRef, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Widget } from '../../models/widget.interface';
import { WidgetLoaderService } from '../../services/widget-loader.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="widget panel panel-default" [ngStyle]="widget.containerStyle">
      <div class="widget-header panel-heading">
        <h3 class="panel-title">
          <span class="widget-title" 
                (dblclick)="editTitle()" 
                [hidden]="widget.editingTitle">{{widget.title}}</span>
          <form *ngIf="widget.editingTitle" 
                class="widget-title" 
                (ngSubmit)="saveTitleEdit($event)">
            <input type="text" 
                   [(ngModel)]="widget.title" 
                   (blur)="titleLostFocus($event)"
                   class="form-control"
                   #titleInput>
          </form>
          <span class="label label-primary">{{widget.name}}</span>
        </h3>
        <div class="buttons">
          <span (click)="removeWidget()" 
                (keyup.enter)="removeWidget()" 
                (keyup.space)="removeWidget()"
                tabindex="0"
                role="button"
                class="glyphicon glyphicon-remove"></span>
          <span (click)="openWidgetSettings()" 
                (keyup.enter)="openWidgetSettings()" 
                (keyup.space)="openWidgetSettings()"
                tabindex="0"
                role="button"
                class="glyphicon glyphicon-cog"></span>
          <span (click)="toggleContent()" 
                (keyup.enter)="toggleContent()" 
                (keyup.space)="toggleContent()"
                tabindex="0"
                role="button"
                class="glyphicon" 
                [ngClass]="{'glyphicon-plus': widget.contentStyle?.['display'] === 'none', 'glyphicon-minus': widget.contentStyle?.['display'] !== 'none'}"></span>
        </div>
      </div>
      <div class="panel-body widget-content" 
           [ngStyle]="widget.contentStyle"
           #widgetContainer></div>
      
      <!-- Resize handles -->
      <div class="widget-w-resizer">
        <div *ngIf="widget.enableVerticalResize" 
             class="nw-resizer" 
             (mousedown)="grabResizer($event, 'nw')"></div>
        <div class="w-resizer" (mousedown)="grabResizer($event, 'w')"></div>
        <div *ngIf="widget.enableVerticalResize" 
             class="sw-resizer" 
             (mousedown)="grabResizer($event, 'sw')"></div>
      </div>
      <div class="widget-e-resizer">
        <div *ngIf="widget.enableVerticalResize" 
             class="ne-resizer" 
             (mousedown)="grabResizer($event, 'ne')"></div>
        <div class="e-resizer" (mousedown)="grabResizer($event, 'e')"></div>
        <div *ngIf="widget.enableVerticalResize" 
             class="se-resizer" 
             (mousedown)="grabResizer($event, 'se')"></div>
      </div>
      <div *ngIf="widget.enableVerticalResize" class="widget-n-resizer">
        <div class="nw-resizer" (mousedown)="grabResizer($event, 'nw')"></div>
        <div class="n-resizer" (mousedown)="grabResizer($event, 'n')"></div>
        <div class="ne-resizer" (mousedown)="grabResizer($event, 'ne')"></div>
      </div>
      <div *ngIf="widget.enableVerticalResize" class="widget-s-resizer">
        <div class="sw-resizer" (mousedown)="grabResizer($event, 'sw')"></div>
        <div class="s-resizer" (mousedown)="grabResizer($event, 's')"></div>
        <div class="se-resizer" (mousedown)="grabResizer($event, 'se')"></div>
      </div>
    </div>
  `,
  styleUrl: './dashboard-widget.component.css'
})
export class DashboardWidgetComponent implements OnInit, OnDestroy {
  @Input() widget!: Widget;
  @Output() widgetRemoved = new EventEmitter<Widget>();
  @Output() widgetChanged = new EventEmitter<Widget>();
  @Output() widgetResized = new EventEmitter<{width?: number, height?: number, widthPixels?: number}>();

  @ViewChild('widgetContainer', { read: ViewContainerRef }) 
  widgetContainer!: ViewContainerRef;
  
  @ViewChild('titleInput') titleInput!: ElementRef;

  private widgetLoader = inject(WidgetLoaderService);
  private dashboardService = inject(DashboardService);

  ngOnInit() {
    if (this.widget.size?.['contentOverflow']) {
      this.widget.contentStyle = this.widget.contentStyle || {};
      this.widget.contentStyle['overflow'] = this.widget.size['contentOverflow'];
    }
    
    setTimeout(() => {
      this.compileTemplate();
    });
  }

  ngOnDestroy() {
    this.widgetContainer?.clear();
  }

  editTitle() {
    this.widget.editingTitle = true;
    setTimeout(() => {
      if (this.titleInput) {
        this.titleInput.nativeElement.focus();
        this.titleInput.nativeElement.setSelectionRange(0, 9999);
      }
    });
  }

  saveTitleEdit(event?: Event) {
    this.widget.editingTitle = false;
    this.widgetChanged.emit(this.widget);
    
    if (event) {
      event.preventDefault();
    }
  }

  titleLostFocus(event: Event) {
    if (this.widget.editingTitle) {
      this.saveTitleEdit(event);
    }
  }

  removeWidget() {
    this.widgetRemoved.emit(this.widget);
  }

  openWidgetSettings() {
    console.log('Widget settings not yet implemented');
  }

  toggleContent() {
    this.widget.contentStyle = this.widget.contentStyle || {};
    this.widget.contentStyle['display'] = 
      this.widget.contentStyle['display'] === 'none' ? 'block' : 'none';
  }

  grabResizer(event: MouseEvent, region: string) {
    console.log('Resize functionality not yet fully implemented for region:', region);
    event.stopPropagation();
    event.preventDefault();
  }

  private compileTemplate() {
    if (this.widgetContainer) {
      this.widgetLoader.loadWidget(this.widget, this.widgetContainer);
    }
  }
}
