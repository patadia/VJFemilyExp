import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-split-master',
  templateUrl: './split-master.page.html',
  styleUrls: ['./split-master.page.scss'],
})
export class SplitMasterPage implements OnInit {
  private _storage: Storage | null = null;
  constructor(public route:Router,
    private storage: Storage) {this.init(); }

  GotoMenu(path){
    if(path === 'home'){
      this._storage.clear();
      this.route.navigate(['./home']);
    }else{

      this.route.navigate(['split-master/'+path]);
    }
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    


  }
  ngOnInit() {
  }

}
