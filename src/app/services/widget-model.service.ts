import { Injectable } from '@angular/core';
import { Widget } from '../models/widget.interface';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class WidgetModelService {
  private defaults() {
    return {
      title: 'Widget',
      style: {},
      size: { width: '33%' },
      enableVerticalResize: true,
      containerStyle: { width: '33%' },
      contentStyle: {}
    };
  }

  createWidget(widgetDefinition: Record<string, unknown>, overrides?: Record<string, unknown>): Widget {
    const widget = _.merge({}, this.defaults(), _.cloneDeep(widgetDefinition), overrides) as unknown as Widget;
    
    this.updateContainerStyle(widget, widget.style);

    if (!widget.templateUrl && !widget.template && !widget.directive) {
      widget.directive = widgetDefinition['name'] as string;
    }

    if (widget.size && _.has(widget.size, 'height')) {
      this.setHeight(widget, widget.size.height);
    }

    if (widget.style && _.has(widget.style, 'width')) {
      this.setWidth(widget, widget.style.width);
    }

    if (widget.size && _.has(widget.size, 'width')) {
      this.setWidth(widget, widget.size.width);
    }

    return widget;
  }

  setWidth(widget: Widget, width: string | number, units?: string): string {
    const widthStr = width.toString();
    const widthUnits = units || widthStr.replace(/^[-.\d]+/, '') || '%';
    let widthNum = parseFloat(widthStr);

    if (widget.size && _.has(widget.size, 'minWidth') && widget.size.minWidth.endsWith(widthUnits)) {
      widthNum = Math.max(parseFloat(widget.size.minWidth), widthNum);
    }

    if (widthNum < 0 || isNaN(widthNum)) {
      console.warn('setWidth was called when width was ' + widthNum);
      return widget.containerStyle['width'] || '33%';
    }

    if (widthUnits === '%') {
      widthNum = Math.min(100, widthNum);
      widthNum = Math.max(0, widthNum);
    }

    widget.containerStyle['width'] = widthNum + widthUnits;
    this.updateSize(widget, widget.containerStyle);

    return widthNum + widthUnits;
  }

  setHeight(widget: Widget, height: string | number): string {
    const heightStr = height + 'px';
    widget.contentStyle['height'] = heightStr;
    this.updateSize(widget, widget.contentStyle);
    return heightStr;
  }

  setStyle(widget: Widget, style: Record<string, string>): void {
    widget.style = style;
    this.updateContainerStyle(widget, style);
  }

  updateSize(widget: Widget, size: Record<string, string>): void {
    Object.assign(widget.size, size);
  }

  updateContainerStyle(widget: Widget, style: Record<string, string>): void {
    Object.assign(widget.containerStyle, style);
  }

  serialize(widget: Widget): Record<string, unknown> {
    return _.pick(widget, ['title', 'name', 'style', 'size', 'dataModelOptions', 'attrs', 'storageHash']);
  }
}
