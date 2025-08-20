import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RandomDataModelService } from '../../../services/random-data-model.service';

@Component({
  selector: 'app-random-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="random-widget">
      <div class="widget-title">Value</div>
      <div class="alert alert-info">{{value}}</div>
    </div>
  `,
  styles: [`
    .random-widget {
      padding: 16px;
      height: 100%;
    }
    .widget-title {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .alert {
      padding: 12px;
      border-radius: 4px;
      margin: 0;
    }
    .alert-info {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
    }
  `]
})
export class RandomWidgetComponent implements OnInit, OnDestroy {
  @Input() value: string | number = '-';
  @Input() dataModel?: RandomDataModelService;

  ngOnInit(): void {
    if (this.dataModel) {
      this.dataModel.setup({ dataAttrName: 'value' }, { widgetData: this.value });
      this.dataModel.init();
    }
  }

  ngOnDestroy(): void {
    if (this.dataModel) {
      this.dataModel.destroy();
    }
  }
}
