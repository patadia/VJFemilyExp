import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private _storage: Storage | null = null;
  constructor(private route: Router, private storage: Storage) {
    this.init()
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }
   makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }
  
  async gotofamilytreecreate() {
    console.log('i am here');
    this.route.navigate(['./familytree']);
    try {
      
      let ID = await this._storage?.set('familykeyID',this.makeid());
      console.log(ID);
    } catch (error) {
      console.warn(error)
    }

  }
}
