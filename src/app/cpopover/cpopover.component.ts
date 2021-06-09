import { Component, OnInit } from '@angular/core';
import {  NavParams, PopoverController } from '@ionic/angular';
import{StorageService} from '../services/storage.service';

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
private Fkey:string;
public AddBtn:boolean= true;

  constructor(private popover:PopoverController, 
    private navParams: NavParams,
    private Store:StorageService) { 

      this.Store.init().then(()=>{

        this.init();
      //  this.AddBtn = true;
      })
  }
  

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);

    this.byName =  await this.Store.GetStorevalue('name_user');
this.Fkey = await this.Store.GetStorevalue('familykeyID');
 
  }
  ngOnInit() {
    console.log(this.navParams.data.ExpenseData);
    if (this.navParams)
    {
      console.log('navparam',this.navParams);
      this.AddBtn= false;
      (<HTMLInputElement>document.getElementById('title')).value = this.navParams.data.ExpenseData.Title;
      ((<HTMLInputElement>document.getElementById('amount')).value)= this.navParams.data.ExpenseData.Amount
    }
  }

  Add_data(){
    
    const data = {
      Title:(<HTMLInputElement>document.getElementById('title')).value.trim(),
      Amount:((<HTMLInputElement>document.getElementById('amount')).value).replace(/\D/g, ''),
      Transaction_Type : this.type,
      date_on: new Date().toLocaleString(),
      Date_unix: parseInt((new Date().getTime() / 1000).toFixed(0)),
      byName:this.byName,
      FamilyKey:this.Fkey
    }

    //console.log(data);
    if(!data.Title || !data.Amount || !data.Transaction_Type ){
      alert('Add All the Field');
      return;
    }
    this.popover.dismiss({
      "Add_data":data
    })
  }

  verifyModel(dta:any){

  }

  onChange(mySelect){
  this.type = mySelect.detail.value;
   //console.log(mySelect.detail.value);
  }
}
