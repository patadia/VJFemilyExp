import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

if (environment.production) {
  enableProdMode();
}
fetch('https://firestoreconfig.herokuapp.com/confg').then(resp => resp.json()).then(config => {
  window['firebase_config'] = config.firebase;
  window['config'] = config;
  console.log(config,config.firebase);
  platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
});
// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.log(err));
defineCustomElements(window);