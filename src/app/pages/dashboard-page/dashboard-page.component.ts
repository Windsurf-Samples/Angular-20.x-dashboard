import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { WidgetDefinition, DashboardOptions } from '../../models/widget-definition.interface';
import { RandomDataModelService } from '../../services/random-data-model.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, DashboardComponent],
  template: `
    <div class="dashboard-page">
      <p>
        <button 
          (click)="prependWidget()" 
          (keyup.enter)="prependWidget()"
          style="cursor: pointer; color: #007bff; text-decoration: underline; background: none; border: none; padding: 0;">
          Click here
        </button>
        to add new widget to beginning of dashboard. This demonstrates the prependWidget function. 
        See <a href="https://github.com/DataTorrent/malhar-angular-dashboard/issues/141" target="_blank">issue #141</a>.
      </p>

      <div class="row">
        <div class="col-md-12">
          <app-dashboard [options]="dashboardOptions" class="dashboard-container"></app-dashboard>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 20px;
    }
    
    .row {
      margin: 0 -15px;
    }
    
    .col-md-12 {
      padding: 0 15px;
    }
    
    .dashboard-container {
      display: block;
    }
    
    p {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    
    a {
      color: #007bff;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  dashboardOptions: DashboardOptions = {};

  constructor(private randomDataModelService: RandomDataModelService) {}

  ngOnInit(): void {
    const widgetDefinitions: WidgetDefinition[] = [
      {
        name: 'random',
        directive: 'wt-scope-watch',
        attrs: {
          value: 'randomValue'
        }
      },
      {
        name: 'time',
        directive: 'wt-time'
      },
      {
        name: 'datamodel',
        directive: 'wt-scope-watch',
        dataAttrName: 'value',
        dataModelType: 'RandomDataModelService'
      },
      {
        name: 'resizable',
        templateUrl: 'app/template/resizable.html',
        attrs: {
          class: 'demo-widget-resizable'
        }
      },
      {
        name: 'fluid',
        directive: 'wt-fluid',
        size: {
          width: '50%',
          height: '250px'
        }
      }
    ];

    const defaultWidgets = [
      { name: 'random', title: 'Random' },
      { name: 'time', title: 'Time' },
      { name: 'datamodel', title: 'Data Model' },
      {
        name: 'random',
        title: 'Random Widget',
        style: {
          width: '50%',
          minWidth: '39%'
        }
      },
      {
        name: 'time',
        title: 'Time Widget',
        style: {
          width: '50%'
        }
      }
    ];

    this.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      storage: localStorage,
      storageId: 'demo_simple'
    };
  }

  prependWidget(): void {
    console.log('Prepend widget functionality - to be implemented');
  }
}
