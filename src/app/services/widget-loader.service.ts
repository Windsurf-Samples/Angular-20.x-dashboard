import { Injectable, ComponentRef, ViewContainerRef } from '@angular/core';
import { Widget, WidgetDefinition } from '../models/widget.interface';
import { TimeWidgetComponent } from '../widgets/time-widget/time-widget.component';

@Injectable({
  providedIn: 'root'
})
export class WidgetLoaderService {
  private widgetDefinitions: WidgetDefinition[] = [
    {
      name: 'time',
      title: 'Time Widget',
      component: TimeWidgetComponent,
      framework: 'angular'
    }
  ];

  getWidgetDefinition(name: string): WidgetDefinition | undefined {
    return this.widgetDefinitions.find(def => def.name === name);
  }

  loadWidget(widget: Widget, container: ViewContainerRef): ComponentRef<unknown> | null {
    const definition = this.getWidgetDefinition(widget.name);
    if (!definition) return null;

    if (definition.framework === 'angular' && definition.component) {
      return container.createComponent(definition.component as never);
    }
    
    console.warn('AngularJS widget loading not yet implemented:', widget.name);
    return null;
  }
}
