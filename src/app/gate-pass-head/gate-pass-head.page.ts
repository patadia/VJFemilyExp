import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { StorageService } from '../services/storage.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { phoneNumberValidator } from 'ngx-intl-tel-input/lib/ngx-intl-tel-input.validator';

interface headMember {
  Name: string,
  username: string,
  password: string,
  ishead: boolean,
  FamilyKey: string,
  Mobile: string;
  isDelete: boolean,
  Syncdate:number
}

@Component({
  selector: 'app-gate-pass-head',
  templateUrl: './gate-pass-head.page.html',
  styleUrls: ['./gate-pass-head.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatePassHeadPage implements OnInit {

  FormLoginregister: FormGroup;
  public ishidden: boolean = false;
  registerNote: string = '';
  _headmem: headMember;
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  

  constructor(private firebaseService: FirebaseService,
    public fb: FormBuilder,
    private Store: StorageService,
    private cd: ChangeDetectorRef,
    public route: Router) {
    this.Store.init()
    this._headmem = {} as headMember;
  }

  ngOnInit() {
    this.FormLoginregister = this.fb.group({
      Name: new FormControl('', Validators.required),
      username: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')])),
      password: new FormControl('', Validators.required),
      phone: new FormControl(undefined, Validators.required),
      ishead: true,
      isDelete: false,
      FamilyKey: this.makeid()
    })
  }

  makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }



  LoginRegister() {
    try {

      //console.log(this.FormLoginregister.value);
      const data = this.FormLoginregister.value;
      var dataobj = data as headMember;
      dataobj.Mobile = data.phone.countryCode + '-' + data.phone.dialCode + '-' + data.phone.number;
      const veryfysub = this.firebaseService.varify_Members(dataobj).subscribe(async (d: any) => {
        console.log(d);
        if (d.length == 0) {

          console.log('empty bucket');
          this.registerNote = 'No login found want to register with same detail?';
          this.ishidden = true;
          this.cd.detectChanges();
          veryfysub.unsubscribe();
        }
        else {
          let ID = await this.Store.SetStorageData("fcmID", d[0].payload.doc.id);
          let userid = await this.Store.SetStorageData("KeyUserID", d[0].payload.doc.id);
          console.log(d[0].payload.doc.data());
          //alert(userid);
          this._headmem = d[0].payload.doc.data() as headMember;
          this.gotoMemberListPage();
          console.log('we can go ahead');
          veryfysub.unsubscribe();
        }
      });

    } catch (error) {
      console.log('Error in login', error);
    }
  }

  async register() {
    
    try {
      var data = this.FormLoginregister.value;
      var dataobj = {} as headMember;
      dataobj.Name = data.Name;
      dataobj.username = data.username;
      dataobj.password = data.password;
      dataobj.FamilyKey = data.FamilyKey;
      dataobj.ishead = data.ishead;
      dataobj.Mobile = data.phone.countryCode + '-' + data.phone.dialCode + '-' + data.phone.number;
      dataobj.isDelete = data.isDelete;
      dataobj.Syncdate = parseInt((new Date(new Date().toUTCString()).getTime() / 1000).toFixed(0));
      console.log('regobj', dataobj);

      var userexist = this.firebaseService.veryfin_member_Exist_user(dataobj).subscribe((s) => {
        
        console.log('verifyuseremail', s.length);
  
        if (s.length == 0) {
  
          var mobileexist = this.firebaseService.veryfin_member_Exist_mobile(dataobj).subscribe((s) => {
            
            userexist.unsubscribe();
            console.log('verifyusermobile', s.length);
            if (s.length == 0) {
              dataobj.isDelete = false;
              dataobj.ishead = true;
              this.firebaseService.create_Member(dataobj).then(async (account) => {
                console.log(account);
                let ID = await this.Store.SetStorageData("fcmID", account.id);
                let userid = await this.Store.SetStorageData("KeyUserID", account.id);
                this._headmem = this.FormLoginregister.value as headMember;
                this.gotoMemberListPage();
               
              })
              
              mobileexist.unsubscribe();
            }
            else {
              
              alert('Already exist user');
              
              mobileexist.unsubscribe();
            }
          })
        } else {
         
          alert('Already exist user');
         
          userexist.unsubscribe();
        }
      
      })

     
       
    //this.processing = false;

    } catch (error) {
      console.log('registration error', error);
      
    }
  }

  
  async gotoMemberListPage() {
    try {
      let ID = await this.Store.SetStorageData('familykeyID', this._headmem.FamilyKey);
      console.log('family key', ID);
      let name = await this.Store.SetStorageData("name_user", this._headmem.Name);

      //
      let keyuserid = await this.Store.SetStorageData('ISKeyUser', 'HeadLogedin');
      let uname = await this.Store.SetStorageData("Current_uname", this._headmem.username);
      this.route.navigate(['./split-master/familytree']);
    } catch (error) {
      console.log('on other page to go', error);
    }
  }

}
