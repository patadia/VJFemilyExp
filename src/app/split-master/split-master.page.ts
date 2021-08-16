import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, IonRouterOutlet, Platform } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-split-master',
  templateUrl: './split-master.page.html',
  styleUrls: ['./split-master.page.scss'],
})
export class SplitMasterPage implements OnInit {

  ishidden: boolean = true;
  fkey:string ='';
  constructor(public route: Router,
    private Store: StorageService,
    private platform:Platform,
    private routerOutlet: IonRouterOutlet,
    private actionSheetCtrl: ActionSheetController) {
    this.Store.init().then(() => {

      this.init();
    })

    
    this.platform.backButton.subscribeWithPriority(20, async() => {
       if (this.routerOutlet.canGoBack()) {
        let actionSheet = await this.actionSheetCtrl.create({
          header: 'Are you sure, you wants to Exit?',
          buttons: [{
            text: 'Exit',
            handler: async () => {
              App.exitApp();
              let navTransition = actionSheet.dismiss();
              return false;
            },
          },
          {
            text: 'No',
            handler: () => {
              let navTransition = actionSheet.dismiss();
              return false;
            },
          }]
        });

        await actionSheet.present();
      
       }
    });
  }

  GotoMenu(path) {
    if (path === 'home') {
      this.Store.ClearStore();
      this.route.navigate(['./home']);
    } else {

      this.route.navigate(['split-master/' + path])
    }
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);

    let check = await this.Store.GetStorevalue('ISKeyUser');
    if (check === 'HeadLogedin')
      this.ishidden = false;
    
    this.fkey = await this.Store.GetStorevalue('familykeyID');


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


