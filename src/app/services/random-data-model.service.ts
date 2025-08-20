import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { BaseWidgetDataModel } from '../models/widget-data-model';

@Injectable({
  providedIn: 'root'
})
export class RandomDataModelService extends BaseWidgetDataModel {
  private intervalSubscription?: Subscription;
  private limit = 100;

  init(): void {
    const dataModelOptions = this.dataModelOptions;
    this.limit = (dataModelOptions && dataModelOptions['limit']) ? dataModelOptions['limit'] as number : 100;

    this.updateScope({ value: '-' });
    this.startInterval();
  }

  private startInterval(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }

    this.intervalSubscription = interval(500).subscribe(() => {
      const value = Math.floor(Math.random() * this.limit);
      this.updateScope({ value });
    });
  }

  updateLimit(limit: number): void {
    this.dataModelOptions = this.dataModelOptions ? this.dataModelOptions : {};
    this.dataModelOptions['limit'] = limit;
    this.limit = limit;
  }

  destroy(): void {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }
}
