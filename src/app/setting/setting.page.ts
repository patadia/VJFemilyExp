import { Component, OnInit } from '@angular/core';
import {StorageService} from '../services/storage.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  showbal =false;
  constructor(
    public Store:StorageService
  ) { 

    this.Store.init().then(() => {

      this.init();
    })

    
  }
  async init() {
    this.showbal = await this.Store.GetPbalFlag();
  }

  ngOnInit() {
  }

  Showbalactivity(s){
    
    console.log('is toggle on!',s.detail.checked);
    this.Store.SetPbfalg(s.detail.checked);
  }

}
