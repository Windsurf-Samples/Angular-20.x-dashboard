import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-fluid-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="demo-widget-fluid">
      <div>
        <p>Widget takes 100% height (blue border).</p>
        <p>Resize the widget vertically to see that this text (red border) stays middle aligned.</p>
        <p>New width: {{width}}</p>
        <p>New height: {{height}}</p>
      </div>
    </div>
  `,
  styles: [`
    .demo-widget-fluid {
      padding: 16px;
      height: 100%;
      border: 2px solid blue;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .demo-widget-fluid > div {
      border: 1px solid red;
      padding: 8px;
      text-align: center;
    }
    p {
      margin: 4px 0;
    }
  `]
})
export class FluidWidgetComponent {
  @Input() width = '100%';
  @Input() height = '250px';
}
