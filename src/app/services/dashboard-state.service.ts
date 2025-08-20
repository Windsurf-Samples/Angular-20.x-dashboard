import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Widget } from '../models/widget.interface';
import { WidgetDefCollectionService } from './widget-def-collection.service';
import { WidgetModelService } from './widget-model.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private widgetModelService = inject(WidgetModelService);

  createState(
    storage: Storage,
    id: string,
    hash: string,
    widgetDefinitions: WidgetDefCollectionService,
    stringify = true
  ): DashboardState {
    return new DashboardState(storage, id, hash, widgetDefinitions, stringify, this.widgetModelService);
  }
}

export class DashboardState {
  constructor(
    private storage: Storage,
    private id: string,
    private hash: string,
    private widgetDefinitions: WidgetDefCollectionService,
    private stringify: boolean,
    private widgetModelService: WidgetModelService
  ) {}

  save(widgets: Widget[]): boolean {
    if (!this.storage) {
      return true;
    }

    const serialized = widgets.map(widget => this.widgetModelService.serialize(widget));
    const data = { widgets: serialized, hash: this.hash };
    const item = this.stringify ? JSON.stringify(data) : data;

    try {
      this.storage.setItem(this.id, typeof item === 'string' ? item : JSON.stringify(item));
      return true;
    } catch (e) {
      console.error('Failed to save dashboard state:', e);
      return false;
    }
  }

  load(): Widget[] | Observable<Widget[]> | null {
    if (!this.storage) {
      return null;
    }

    let serialized: unknown;

    try {
      serialized = this.storage.getItem(this.id);
    } catch {
      console.error('Failed to load dashboard state');
      return null;
    }

    if (serialized) {
      if (typeof serialized === 'object' && serialized && 'then' in serialized) {
        return this.handleAsyncLoad(serialized as Promise<unknown>);
      }
      return this.handleSyncLoad(serialized);
    } else {
      return null;
    }
  }

  private handleSyncLoad(serialized: unknown): Widget[] | null {
    let deserialized: Record<string, unknown>;
    const result: Widget[] = [];

    if (!serialized) {
      return null;
    }

    if (this.stringify) {
      try {
        deserialized = JSON.parse(serialized as string) as Record<string, unknown>;
      } catch {
        console.warn('Serialized dashboard state was malformed and could not be parsed: ', serialized);
        return null;
      }
    } else {
      deserialized = serialized as Record<string, unknown>;
    }

    if (deserialized['hash'] !== this.hash) {
      console.info('Serialized dashboard from storage was stale (old hash: ' + deserialized['hash'] + ', new hash: ' + this.hash + ')');
      this.storage.removeItem(this.id);
      return null;
    }

    const savedWidgetDefs = deserialized['widgets'] as unknown[];

    for (const savedWidgetDef of savedWidgetDefs) {
      const widgetData = savedWidgetDef as Record<string, unknown>;
      const widgetDefinition = this.widgetDefinitions.getByName(widgetData['name'] as string);

      if (!widgetDefinition) {
        console.warn('Widget with name "' + widgetData['name'] + '" was not found in given widget definition objects');
        continue;
      }

      if (widgetDefinition.storageHash && widgetDefinition.storageHash !== widgetData['storageHash']) {
        console.info('Widget Definition Object with name "' + widgetData['name'] + '" was found ' +
          'but the storageHash property on the widget definition is different from that on the ' +
          'serialized widget loaded from storage. hash from storage: "' + widgetData['storageHash'] + '"' +
          ', hash from WDO: "' + widgetDefinition.storageHash + '"');
        continue;
      }

      result.push(widgetData as unknown as Widget);
    }

    return result;
  }

  private handleAsyncLoad(promise: Promise<unknown>): Observable<Widget[]> {
    return new Observable(observer => {
      promise.then(
        (res) => {
          const result = this.handleSyncLoad(res);
          if (result) {
            observer.next(result);
            observer.complete();
          } else {
            observer.error(result);
          }
        },
        (res) => {
          observer.error(res);
        }
      );
    });
  }
}
