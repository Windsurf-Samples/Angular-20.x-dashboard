import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TimeWidgetComponent } from './widgets/time-widget/time-widget.component';
import { WidgetRegistryService } from './services/widget-registry.service';

@NgModule({
  imports: [
    BrowserModule,
    AppComponent,
    TimeWidgetComponent
  ],
  providers: [WidgetRegistryService],
  bootstrap: [AppComponent]
})
export class AppModule {}
