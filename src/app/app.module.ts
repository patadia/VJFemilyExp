import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { AngularFirestoreModule,SETTINGS}from '@angular/fire/firestore'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {Storage}from '@ionic/storage';
import { DatePipe } from '@angular/common';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(),
     AppRoutingModule,
     FormsModule,ReactiveFormsModule,
     BrowserModule,
  AngularFireModule.initializeApp(environment.firebaseConfig),AngularFirestoreModule],
  providers: [{ provide: RouteReuseStrategy, 
    useClass: IonicRouteStrategy },Storage,DatePipe],
  bootstrap: [AppComponent],
})

export class AppModule {}
