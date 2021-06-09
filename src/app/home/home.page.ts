import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { stringify } from '@angular/compiler/src/util';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subscription } from 'rxjs';
import { PasswordAdminComponent } from '../password-admin/password-admin.component';
import { FirebaseService } from '../services/firebase.service';
import {StorageService} from '../services/storage.service';
import {AnimationOptions} from 'ngx-lottie';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  //private _storage: Storage | null = null;
  public handle:string;
  Formverify: FormGroup;
  private verifysub: Subscription;
  options:AnimationOptions ={
    path:'assets/expense.json'
  }

  constructor(private route: Router,
     //private storage: Storage,
     public popoverc:PopoverController, 
     private firebaseService:FirebaseService
    ,public fb:FormBuilder,
    public Store:StorageService) {
      this.Store.init().then(()=>{
        this.init();
      })
    
  }

  async movetoexpense(id:string){
   // alert(id);
    if(id != null){
      this.route.navigate(['./split-master']);
    }
  }

  async ngOnInit() {
    this.Formverify = this.fb.group({
      username: new FormControl('',Validators.required),
      FamilyKey: new FormControl('',Validators.required),
    })
  }

  async init(){
    // const storage = await this.storage.create();
    // this._storage = storage;
    try {
      
      let check = await this.Store.GetStorevalue('ISKeyUser');
      console.log(check);
     // alert(check);
      if(check === 'Logedin'){
        let userid = await this.Store.GetStorevalue('KeyUserID');
        console.log(userid);
          this.movetoexpense(userid);
      }

      if(check === 'HeadLogedin'){
        console.log(check);
          // this.route.navigate(['./familytree']);
          let userid = await this.Store.GetStorevalue('KeyUserID');
         // alert(userid);
          this.movetoexpense(userid);

      }
    

    } catch (error) {
      alert(error);
      console.log(error);
    }
  }
  
  
  async verifyRecord(){
    console.log(this.Formverify.value);
      try {
       this.verifysub =  this.firebaseService.varify_user(this.Formverify.value).subscribe(async(d:any)=>{
          console.log(d);
            if(d.length>0){
              let ID = await this.Store.SetStorageData('KeyUserID',d[0].payload.doc.id);
              console.log(ID);
              let Loginuser = 'Logedin'
              if(d[0].payload.doc.data()['ishead'] === true){
                Loginuser = 'HeadLogedin'
              }
              let usercheck = await this.Store.SetStorageData('ISKeyUser',Loginuser);
              console.log(usercheck);
              let name = await this.Store.SetStorageData("name_user",d[0].payload.doc.data()['Name']);
              let femID = await this.Store.SetStorageData("fcmID",d[0].payload.doc.id);
              let uname = await this.Store.SetStorageData("Current_uname",d[0].payload.doc.data()['username']);
              let fkey = await this.Store.SetStorageData("familykeyID",d[0].payload.doc.data()['FamilyKey']);
              this.Formverify.reset();
              this.movetoexpense(d[0].payload.doc.id);
              this.UnsubScribe();
            }else{
              this.Formverify.reset();
              alert('No user found.');
             this.UnsubScribe();
            }
        })
      } catch (error) {
        console.log(error);
      }
  }
  async gotofamilytreecreate() {
    // console.log('i am here');
    // this.route.navigate(['./familytree']);
    // try {
      
    //   let ID = await this._storage?.set('familykeyID',this.makeid());
    //   console.log(ID);
    // } catch (error) {
    //   console.warn(error)
    // }
    this.route.navigate(['./gate-pass-head']);
  //  const pauth_popover = await this.popoverc.create({
  //     component:PasswordAdminComponent
  //   });
  //   pauth_popover.onDidDismiss().then((data:any)=>{
  //     //console.log(data);
  //     console.log(data.data.login);
  //     try {
  //       if(data.data.login === 'Success'){

         
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });
  //   return await pauth_popover.present(); 

  }

  async UnsubScribe(){
    this.verifysub.unsubscribe();
  }

  Created(animation:AnimationEventInit){
      console.log(animation);
  }

}
