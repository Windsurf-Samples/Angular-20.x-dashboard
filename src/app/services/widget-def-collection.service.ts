import { Injectable } from '@angular/core';
import { WidgetDefinition } from '../models/widget.interface';

@Injectable({
  providedIn: 'root'
})
export class WidgetDefCollectionService {
  private definitions: WidgetDefinition[] = [];
  private map: Record<string, WidgetDefinition> = {};


  initialize(widgetDefs: WidgetDefinition[]): void {
    this.definitions = [];
    this.map = {};
    this.addDefinitions(widgetDefs);
  }

  private addDefinitions(widgetDefs: WidgetDefinition[]): void {
    const convertedDefs = widgetDefs.map(this.convertToDefinition);
    this.definitions.push(...convertedDefs);
    
    convertedDefs.forEach(widgetDef => {
      this.map[widgetDef.name] = widgetDef;
    });
  }

  private convertToDefinition(d: unknown): WidgetDefinition {
    if (typeof d === 'function') {
      return new (d as new () => WidgetDefinition)();
    }
    return d as WidgetDefinition;
  }

  getByName(name: string): WidgetDefinition | undefined {
    return this.map[name];
  }

  add(def: WidgetDefinition): void {
    const convertedDef = this.convertToDefinition(def);
    this.definitions.push(convertedDef);
    this.map[convertedDef.name] = convertedDef;
  }

  getAll(): WidgetDefinition[] {
    return [...this.definitions];
  }

  get length(): number {
    return this.definitions.length;
  }
}
