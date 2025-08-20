import { Component, OnInit, AfterViewInit, ElementRef, inject } from '@angular/core';
import { WidgetRegistryService } from './services/widget-registry.service';
import { TimeWidgetComponent } from './widgets/time-widget/time-widget.component';

declare const angular: unknown;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TimeWidgetComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Hybrid Angular Dashboard';

  private widgetRegistry = inject(WidgetRegistryService);
  private elementRef = inject(ElementRef);


  ngOnInit() {
    this.widgetRegistry.registerAngularWidgets();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const dashboardElement = this.elementRef.nativeElement.querySelector('.dashboard-section');
      if (dashboardElement && angular && !dashboardElement.hasAttribute('ng-scope')) {
        try {
          (angular as unknown as { bootstrap: (element: Element, modules: string[]) => void }).bootstrap(dashboardElement, ['app']);
        } catch (error) {
          console.warn('AngularJS bootstrap failed:', error);
        }
      }
    }, 100);
  }
}
