import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, Platform } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-split-master',
  templateUrl: './split-master.page.html',
  styleUrls: ['./split-master.page.scss'],
})
export class SplitMasterPage implements OnInit {

  ishidden: boolean = true;
  constructor(public route: Router,
    private Store: StorageService,
    private platform:Platform,
    private routerOutlet: IonRouterOutlet) {
    this.Store.init().then(() => {

      this.init();
    })

    
    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  GotoMenu(path) {
    if (path === 'home') {
      this.Store.ClearStore();
      this.route.navigate(['./home']);
    } else {

      this.route.navigate(['split-master/' + path]);
    }
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);

    let check = await this.Store.GetStorevalue('ISKeyUser');
    if (check === 'HeadLogedin')
      this.ishidden = false;


  }
  ngOnInit() {
  }

  ChangeColor(event) {

    let systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    systemDark.addEventListener('change', this.colorTest);
    console.log(systemDark);
    if (event.detail.checked) {
      document.body.setAttribute('data-theme', 'dark');
      console.log('dark')
    }
    else {
      document.body.setAttribute('data-theme', 'light');
      console.log('light')
    }
  }

  colorTest(systemInitiatedDark) {
    console.log('colottest');
    if (systemInitiatedDark.matches) {
      console.log('dark')
      document.body.setAttribute('data-theme', 'dark');
    } else {
      console.log('light')
      document.body.setAttribute('data-theme', 'light');
    }
  }
}


