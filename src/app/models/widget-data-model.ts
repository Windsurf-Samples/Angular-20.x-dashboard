export interface WidgetDataModel {
  dataAttrName?: string;
  dataModelOptions?: Record<string, unknown>;
  widgetScope?: Record<string, unknown>;
  
  setup(widget: Record<string, unknown>, scope: Record<string, unknown>): void;
  updateScope(data: Record<string, unknown>): void;
  init(): void;
  destroy(): void;
}

export abstract class BaseWidgetDataModel implements WidgetDataModel {
  dataAttrName?: string;
  dataModelOptions?: Record<string, unknown>;
  widgetScope?: Record<string, unknown>;

  setup(widget: Record<string, unknown>, scope: Record<string, unknown>): void {
    this.dataAttrName = widget['dataAttrName'] as string;
    this.dataModelOptions = widget['dataModelOptions'] as Record<string, unknown>;
    this.widgetScope = scope;
  }

  updateScope(data: Record<string, unknown>): void {
    if (this.widgetScope) {
      this.widgetScope['widgetData'] = data;
    }
  }

  abstract init(): void;
  abstract destroy(): void;
}
