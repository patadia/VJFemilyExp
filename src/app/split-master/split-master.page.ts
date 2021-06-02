import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-split-master',
  templateUrl: './split-master.page.html',
  styleUrls: ['./split-master.page.scss'],
})
export class SplitMasterPage implements OnInit {
 
  ishidden: boolean = true;
  constructor(public route: Router,
    private Store: StorageService) { 
      this.Store.init().then(()=>{

        this.init(); 
      })  
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

}
