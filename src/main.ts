import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import './app/legacy/dashboard-module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((err) => console.error(err));
