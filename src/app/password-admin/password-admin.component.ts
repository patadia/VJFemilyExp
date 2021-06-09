import { Component,OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-password-admin',
  templateUrl: './password-admin.component.html',
  styleUrls: ['./password-admin.component.scss'],
})


export class PasswordAdminComponent implements OnInit {
  inputAdminPass:string;
  inputpass:string = '';
  constructor(public popoverc:PopoverController) { }
  ngOnInit() {

  }

  PasswordAuth(){
      let passauth = (<HTMLInputElement>document.getElementById('passinput')).value;
      console.log(this.inputpass);
    // if(passauth === environment.headpass){
    //   this.popoverc.dismiss({
    //     "login":"Success"
    //   });
    // }else{
    //   alert('offfo Wrong Password, please Try again !!');
    // }
  }

  onchanhe(ent){
    console.log(ent);
  }

}
