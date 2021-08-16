import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule, FirebaseApp, FirebaseOptions, FIREBASE_OPTIONS } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule, PERSISTENCE_SETTINGS, SETTINGS } from '@angular/fire/firestore'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SQLite } from '@ionic-native/sqlite/ngx'
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx'
import { HttpClientModule } from '@angular/common/http'
import {AngularFireStorageModule} from '@angular/fire/storage';
import {PhotoViewer}from '@ionic-native/photo-viewer/ngx';
import {File} from '@ionic-native/file/ngx';
import {SocialSharing} from '@ionic-native/social-sharing/ngx'
import { LocalNotifications} from '@ionic-native/local-notifications/ngx'
import { preserveWhitespacesDefault } from '@angular/compiler';

export class AppConfigService {
  static settings: IAppConfig;
  constructor() { }
  fireConfig() {
    AppConfigService.settings = window['config'];
    return window['firebase_config']
  }
}
export interface IAppConfig {
  production: boolean;
  name: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
  };
}
export function initializeApp(appConfig: AppConfigService) {
  return appConfig.fireConfig()
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule, ReactiveFormsModule,
    BrowserModule,
    AngularFireModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ], //
  providers: [
    AppConfigService,
    {
      provide: FIREBASE_OPTIONS,//FIREBASE_OPTIONS.toString(),
      deps: [AppConfigService],
      useFactory: initializeApp
    },
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    }, Storage, DatePipe,
    SQLitePorter,
    SQLite,PhotoViewer,
    File,SocialSharing,
    LocalNotifications],
  bootstrap: [AppComponent],
})


export class AppModule {

}


