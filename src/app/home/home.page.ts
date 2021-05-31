import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PasswordAdminComponent } from '../password-admin/password-admin.component';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private _storage: Storage | null = null;
  public handle:string;
  Formverify: FormGroup;
  constructor(private route: Router,
     private storage: Storage,public popoverc:PopoverController, 
     private firebaseService:FirebaseService
    ,public fb:FormBuilder) {
   
    this.init();
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
    const storage = await this.storage.create();
    this._storage = storage;
    try {
      
      let check = await this._storage?.get('ISKeyUser');
      console.log(check);
     // alert(check);
      if(check === 'Logedin'){
        let userid = await this.storage.get('KeyUserID');
        console.log(userid);
          this.movetoexpense(userid);
      }

      if(check === 'HeadLogedin'){
        console.log(check);
          // this.route.navigate(['./familytree']);
          let userid = await this.storage.get('KeyUserID');
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
        this.firebaseService.varify_user(this.Formverify.value).subscribe(async(d:any)=>{
          console.log(d);
            if(d.length>0){
              let ID = await this._storage?.set('KeyUserID',d[0].id);
              let usercheck = await this._storage?.set('ISKeyUser','Logedin');
              let name = await this._storage.set("name_user",d[0].payload.doc.data()['Name']);
              let femID = await this._storage.set("fcmID",d[0].payload.doc.id);
              let uname = await this._storage.set("Current_uname",d[0].payload.doc.data()['username']);
              this.Formverify.reset();
                this.movetoexpense(d[0].payload.doc.id);
            }else{
              alert('No user found.');
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

   const pauth_popover = await this.popoverc.create({
      component:PasswordAdminComponent
    });
    pauth_popover.onDidDismiss().then((data:any)=>{
      //console.log(data);
      console.log(data.data.login);
      try {
        if(data.data.login === 'Success'){

          this.route.navigate(['./gate-pass-head']);
        }
      } catch (error) {
        console.log(error);
      }
    });
    return await pauth_popover.present(); 

  }

}
