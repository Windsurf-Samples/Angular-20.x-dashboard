import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Widget } from '../models/widget.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private widgetsSubject = new BehaviorSubject<Widget[]>([]);
  private unsavedChangesSubject = new BehaviorSubject<number>(0);

  widgets$ = this.widgetsSubject.asObservable();
  unsavedChanges$ = this.unsavedChangesSubject.asObservable();

  getWidgets(): Widget[] {
    return this.widgetsSubject.value;
  }

  updateWidgets(widgets: Widget[]): void {
    this.widgetsSubject.next([...widgets]);
  }

  addWidget(widget: Widget): void {
    const currentWidgets = this.getWidgets();
    this.updateWidgets([...currentWidgets, widget]);
  }

  removeWidget(widget: Widget): void {
    const currentWidgets = this.getWidgets();
    const index = currentWidgets.indexOf(widget);
    if (index > -1) {
      const newWidgets = [...currentWidgets];
      newWidgets.splice(index, 1);
      this.updateWidgets(newWidgets);
    }
  }

  clearWidgets(): void {
    this.updateWidgets([]);
  }

  incrementUnsavedChanges(): void {
    this.unsavedChangesSubject.next(this.unsavedChangesSubject.value + 1);
  }

  resetUnsavedChanges(): void {
    this.unsavedChangesSubject.next(0);
  }

  widgetChanged(widget: Widget): void {
    this.incrementUnsavedChanges();
    const currentWidgets = this.getWidgets();
    const index = currentWidgets.indexOf(widget);
    if (index > -1) {
      const newWidgets = [...currentWidgets];
      newWidgets[index] = { ...widget };
      this.updateWidgets(newWidgets);
    }
  }
}
