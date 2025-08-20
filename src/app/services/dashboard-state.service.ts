import { Injectable } from '@angular/core';
import { WidgetInstance } from '../models/widget-definition.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private storage: Storage;
  private storageId: string;
  private storageHash: string;
  private stringifyStorage: boolean;

  constructor() {
    this.storage = localStorage;
    this.storageId = 'demo_simple';
    this.storageHash = '';
    this.stringifyStorage = true;
  }

  init(storage: Storage, storageId: string, storageHash?: string, stringifyStorage = true): void {
    this.storage = storage;
    this.storageId = storageId;
    this.storageHash = storageHash || '';
    this.stringifyStorage = stringifyStorage;
  }

  save(widgets: WidgetInstance[]): void {
    if (!this.storage || !this.storageId) {
      return;
    }

    const serializedWidgets = widgets.map(widget => this.serializeWidget(widget));
    const dataToStore = this.stringifyStorage ? JSON.stringify(serializedWidgets) : serializedWidgets;
    
    try {
      this.storage.setItem(this.storageId, dataToStore as string);
    } catch (e) {
      console.error('Failed to save dashboard state:', e);
    }
  }

  load(): WidgetInstance[] | null {
    if (!this.storage || !this.storageId) {
      return null;
    }

    try {
      const stored = this.storage.getItem(this.storageId);
      if (!stored) {
        return null;
      }

      const parsed = this.stringifyStorage ? JSON.parse(stored) : stored;
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      console.error('Failed to load dashboard state:', e);
      return null;
    }
  }

  clear(): void {
    if (this.storage && this.storageId) {
      this.storage.removeItem(this.storageId);
    }
  }

  private serializeWidget(widget: WidgetInstance): Record<string, unknown> {
    return {
      title: widget.title,
      name: widget.name,
      style: widget.style,
      size: widget.size,
      dataModelOptions: widget.dataModelOptions,
      attrs: widget.attrs
    };
  }
}
