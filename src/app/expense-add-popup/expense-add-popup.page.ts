import { Component, OnInit } from '@angular/core';
import {  NavParams, PopoverController } from '@ionic/angular';
import{StorageService} from '../services/storage.service';

@Component({
  selector: 'app-expense-add-popup',
  templateUrl: './expense-add-popup.page.html',
  styleUrls: ['./expense-add-popup.page.scss'],
})
export class ExpenseAddPopupPage implements OnInit {

  public title:string = '';
public amount:any ;
public type:any;
public byName:string='';
public mySelect:any;
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
      if (this.navParams.data?.ExpenseData)
      {
        console.log('navparam',this.navParams);
        this.AddBtn= false;
        this.title = this.navParams.data.ExpenseData.Title;
        this.amount= this.navParams.data.ExpenseData.Amount;
        this.type = this.navParams.data.ExpenseData.Transaction_Type;
        this.mySelect = this.navParams.data.ExpenseData.Transaction_Type;
      }
    }
  
    Add_data(){
      
      const data = {
        Title:this.title.trim(),
        Amount:this.amount.replace(/\D/g, ''),
        Transaction_Type : this.type,
        date_on: new Date().toLocaleString(),
        Date_unix: parseInt((new Date().getTime() / 1000).toFixed(0)),
        byName:this.byName,
        FamilyKey:this.Fkey,
        Syncdate:parseInt((new Date().getTime()/1000).toFixed(0))
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
