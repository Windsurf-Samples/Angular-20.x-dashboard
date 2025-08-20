import { Injectable } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { TimeWidgetComponent } from '../widgets/time-widget/time-widget.component';

declare const angular: unknown;

@Injectable({
  providedIn: 'root'
})
export class WidgetRegistryService {
  
  constructor() {
    this.registerAngularWidgets();
  }
  
  registerAngularWidgets() {
    (angular as any).module('ui.dashboard')
      .directive('appTimeWidget', downgradeComponent({
        component: TimeWidgetComponent
      }) as unknown);
  }
  
  getWidgetDefinitions() {
    return [
      {
        name: 'angular-time',
        directive: 'app-time-widget',
        title: 'Angular Time Widget'
      }
    ];
  }
}
