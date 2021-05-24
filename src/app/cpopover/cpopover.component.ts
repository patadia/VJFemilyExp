import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import{Storage} from '@ionic/storage';

@Component({
  selector: 'app-cpopover',
  templateUrl: './cpopover.component.html',
  styleUrls: ['./cpopover.component.scss'],
})
export class CPopoverComponent implements OnInit {
public title:string ;
public amount:any ;
public type:any;
public byName:string='';
private _storage: Storage | null = null;
  constructor(private popover:PopoverController, private storage:Storage) { 
    this.init();
  }
  

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    this.byName =  await this._storage?.get('name_user');

 
  }
  ngOnInit() {}
  
  Add_data(){
    const data = {
      Title:(<HTMLInputElement>document.getElementById('title')).value,
      Amount:(<HTMLInputElement>document.getElementById('amount')).value,
      Transaction_Type : this.type,
      date_on: new Date().toLocaleString(),
      Date_unix: parseInt((new Date().getTime() / 1000).toFixed(0)),
      byName:this.byName
    }
    //console.log(data);

    this.popover.dismiss({
      "Add_data":data
    })
  }

  onChange(mySelect){
  this.type = mySelect.detail.value;
   //console.log(mySelect.detail.value);
  }
}
