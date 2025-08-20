import { Injectable } from '@angular/core';
import { Widget } from '../models/widget.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageAdapter {
  migrateFromLegacyFormat(data: unknown): Widget[] {
    if (!data || typeof data !== 'object' || !('widgets' in data)) return [];
    
    const typedData = data as { widgets: unknown[] };
    return typedData.widgets.map((legacyWidget: unknown) => {
      const widget = legacyWidget as Record<string, unknown>;
      return {
        title: widget['title'] as string,
        name: widget['name'] as string,
        style: (widget['style'] as Record<string, string>) || {},
        size: (widget['size'] as Record<string, string>) || {},
        attrs: widget['attrs'] as Record<string, unknown>,
        storageHash: widget['storageHash'] as string,
        framework: this.detectFramework(widget['name'] as string)
      } as Widget;
    });
  }

  private detectFramework(widgetName: string): 'angularjs' | 'angular' {
    return widgetName === 'time' ? 'angular' : 'angularjs';
  }

  saveToStorage(storageId: string, widgets: Widget[], hash?: string): void {
    const data = { widgets, hash };
    localStorage.setItem(storageId, JSON.stringify(data));
  }

  loadFromStorage(storageId: string): Widget[] | null {
    const stored = localStorage.getItem(storageId);
    if (!stored) return null;
    
    try {
      const data = JSON.parse(stored);
      return this.migrateFromLegacyFormat(data);
    } catch (e) {
      console.warn('Failed to parse stored dashboard data:', e);
      return null;
    }
  }
}
