import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { PasswordAdminComponent } from '../password-admin/password-admin.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private _storage: Storage | null = null;
  public handle:string;
  Formverify: FormGroup;
  constructor(private route: Router, private storage: Storage,public popoverc:PopoverController
    , public fb:FormBuilder) {
    this.init();
  }

  async ngOnInit() {
    this.Formverify = this.fb.group({
      Name: new FormControl('',Validators.required),
      fkey: new FormControl('',Validators.required),
    })
  }

  async init(){
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
  
  async verifyRecord(){
    console.log(this.Formverify.value);
      
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

          this.route.navigate(['./familytree']);
        }
      } catch (error) {
        console.log(error);
      }
    });
    return await pauth_popover.present(); 

  }
}
