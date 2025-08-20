import { Injectable, ComponentRef, ViewContainerRef, inject } from '@angular/core';
import { Widget, WidgetDefinition } from '../models/widget.interface';
import { TimeWidgetComponent } from '../widgets/time-widget/time-widget.component';
import { WidgetDefCollectionService } from './widget-def-collection.service';

@Injectable({
  providedIn: 'root'
})
export class WidgetLoaderService {
  private widgetDefCollection = inject(WidgetDefCollectionService);

  constructor() {
    this.initializeDefaultWidgets();
  }

  private initializeDefaultWidgets() {
    const defaultWidgets: WidgetDefinition[] = [
      {
        name: 'time',
        title: 'Time Widget',
        component: TimeWidgetComponent,
        framework: 'angular'
      }
    ];
    
    this.widgetDefCollection.initialize(defaultWidgets);
  }

  getWidgetDefinition(name: string): WidgetDefinition | undefined {
    return this.widgetDefCollection.getByName(name);
  }

  getAllWidgetDefinitions(): WidgetDefinition[] {
    return this.widgetDefCollection.getAll();
  }

  loadWidget(widget: Widget, container: ViewContainerRef): ComponentRef<unknown> | null {
    const definition = this.getWidgetDefinition(widget.name);
    if (!definition) {
      console.warn('Widget definition not found:', widget.name);
      return null;
    }

    if (definition.framework === 'angular' && definition.component) {
      return container.createComponent(definition.component as never);
    }
    
    console.warn('AngularJS widget loading not yet implemented:', widget.name);
    return null;
  }

  addWidgetDefinition(definition: WidgetDefinition): void {
    this.widgetDefCollection.add(definition);
  }
}
