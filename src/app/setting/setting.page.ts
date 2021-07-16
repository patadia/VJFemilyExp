import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import {StorageService} from '../services/storage.service';
interface PreBalFlag{
  FamilyKey:string,
  UserId:string,
  Syncdate:number,
  PrebalFlag:boolean
}
@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  showbal =false;
  UserId:string = '';
  FamilyKey:string = '';
  Flag_main_Id = '';
  flag_available : boolean= false;
  constructor(
    public Store:StorageService,
    public fire:FirebaseService
  ) { 

    this.Store.init().then(() => {

      this.init();
    })

    
  }
  async init() {
    //this.showbal = await this.Store.GetPbalFlag();
    this.UserId = await this.Store.GetStorevalue('fcmID');
    this.FamilyKey = await this.Store.GetStorevalue('familykeyID');
    this.getFlagPre();
  }
  getFlagPre() {
   var Prebalres =  this.fire.GetPrebalFlag(this.FamilyKey,this.UserId).subscribe((data:any)=>{
        console.log(data);
        if(data.length > 0)
        {
          this.flag_available = true;
          console.log(data[0]);
          this.Flag_main_Id = data[0].id;
          this.showbal = data[0].PrebalFlag;
        }else{
          this.flag_available = false;
        }
        Prebalres.unsubscribe();
    })
  }

  ngOnInit() {

  }

  Showbalactivity(s){
    let sdate =   parseInt((new Date().getTime() / 1000).toFixed(0));
    let prebalset:PreBalFlag ={
         FamilyKey:this.FamilyKey,
         Syncdate:sdate,
         UserId:this.UserId,
        PrebalFlag: s.detail.checked
    };
    console.log('is toggle on!',s.detail.checked);


    if(this.flag_available){
      this.fire.UpdateFlagPrebal(prebalset,this.Flag_main_Id).then((data)=>{
        console.log(data);
      });
    }else{ 
      //this.Store.SetPbfalg(s.detail.checked);
      this.fire.setFlagPrebal(prebalset).then((s)=>{
        console.log(s);
        this.getFlagPre();
      })
    }
  }

}
