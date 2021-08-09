import { Component, OnInit } from '@angular/core'
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { DataService, TMember } from '../services/data.service';
import { from, Observable } from 'rxjs';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import {Share} from '@capacitor/share';


interface Familytree {
  Name: string;
  username: number;
  ishead: boolean;
  isDelete: boolean;
}

@Component({
  selector: 'app-familytree',
  templateUrl: './familytree.page.html',
  styleUrls: ['./familytree.page.scss'],
})
export class FamilytreePage implements OnInit {

  public Familykey: string = '';
  public Cuser:string = '';
  Members = [];
  _familydata: Familytree;
  FormCreateFamilyHead: FormGroup;
  MembersData: TMember[] = [];
  member = {};
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
  syncDate: any;
  constructor(private firebaseService: FirebaseService,
    public fb: FormBuilder,
    public Store: StorageService,
    private route: Router,
    public actionSheetCtrl: ActionSheetController,
    private db: DataService
  ) {
    this._familydata = {} as Familytree;
    this.Store.init().then(() => {

      this.init();
    })

  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);

    this.Familykey = await this.Store.GetStorevalue('familykeyID');
    this.Cuser = await this.Store.GetStorevalue('Current_uname');
   
    //console.log('getsyncdatemodel', this.syncDate);
    this.GetMembers();
    this.getfromdb();

  }

  getfromdb() {
  var readdata = this.db.fetchMembers(this.Familykey).subscribe((s) => {
      console.log('dataread from json', JSON.stringify(s));
      this.Members = s.map(e => {

        return {
          id: e.MFCM_ID,
          Name: e.m_name,
          username: e.Email,
          ishead: e.ishead,
          FamilyKey: e.FamilyKey,
          IsMaster:e.IsMaster
        };
      })
    //  readdata.unsubscribe();
    });
  }

  async GetMembers() {
    this.syncDate = await this.Store.GetSyncDate('Member');
    console.log('getsyncdatemodel', this.syncDate);

    try {
      var getMember = this.firebaseService.read_Members_sync(this.Familykey, this.syncDate).subscribe((data:any) => {
          console.log("Member data==-----> from firebase   ",JSON.stringify(data));
          console.log(data);
        var dataMembers = data.map(e => {
          let Ismastered = false
          if(e.IsMaster !== undefined){
            Ismastered = e.IsMaster;
          }
          this.member = {
            Email: e.username,
            FamilyKey: this.Familykey,
            MFCM_ID: e.id,
            Mobile: e.Mobile,
            ishead: e.ishead,
            m_name: e.Name,
            isDelete: e.isDelete,
            Syncdate:e.Syncdate,
            IsMaster:Ismastered
          };
          // this.member = {
          //   Email: e.payload.doc.data()['username'],
          //   FamilyKey: this.Familykey,
          //   MFCM_ID: e.payload.doc.id,
          //   Mobile: e.payload.doc.data()['Mobile'],
          //   ishead: e.payload.doc.data()['ishead'],
          //   m_name: e.payload.doc.data()['Name'],
          //   isDelete: e.payload.doc.data()['isDelete'],
          //   Syncdate:e.payload.doc.data()['Syncdate'],
          //   IsMaster:Ismastered
          // };

          this.db.AddMember(this.member).then(() => {
            console.log('Added ', this.member);
            //this.member = {};
          });


          // return {
          //   id: e.payload.doc.id,
          //   Name: e.payload.doc.data()['Name'],
          //   username: e.payload.doc.data()['username'],
          //   ishead: e.payload.doc.data()['ishead']

          // };
        })
        
        var setnew =  this.Store.SetSyncDate(new Date().toUTCString(), 'Member');
        console.log(setnew);
        getMember.unsubscribe();
        setTimeout(() => {
          
          this.getfromdb();
        }, 1500);
       // this.getfromdb();
        //console.log('check  multy $$$$$$$$');
       // this.GetMembers();
        // this.fetchdata();
      })
    } catch (e) {
      console.log(e);
     // this.getfromdb();
    }
  }



  async ngOnInit() {
    this.FormCreateFamilyHead = this.fb.group({
      Name: new FormControl('', Validators.required),
      username: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')])),
      FamilyKey: this.Familykey,
      phone: new FormControl(undefined, Validators.required),
      isDelete: false,
      ishead: false
    })

  }

  ngOnDestroy() {

  }

  CreateRecord() {
    console.log(this.FormCreateFamilyHead.value);
    this.FormCreateFamilyHead.value.FamilyKey = this.Familykey;
    var data = this.FormCreateFamilyHead.value;
    var dataobj: any = {};
    dataobj.Name = data.Name;
    dataobj.username = data.username;
    // dataobj.password = data.password;
    dataobj.FamilyKey = data.FamilyKey;
    dataobj.ishead = data.ishead;
    dataobj.Mobile = data.phone.countryCode + '-' + data.phone.dialCode + '-' + data.phone.number;
    dataobj.isDelete = data.isDelete;
    console.log('regobj', dataobj);
    var userexist = this.firebaseService.veryfin_member_Exist_user(dataobj).subscribe((s) => {
      console.log('verifyuseremail', s.length);

      if (s.length == 0) {

        var mobileexist = this.firebaseService.veryfin_member_Exist_mobile(dataobj).subscribe((s) => {
          userexist.unsubscribe();
          console.log('verifyusermobile', s.length);
          if (s.length == 0) {
            dataobj.isDelete = false;
            dataobj.ishead = false;
            dataobj.Syncdate = parseInt((new Date(new Date().toUTCString()).getTime() / 1000).toFixed(0));
            this.firebaseService.create_Member(dataobj).then(resp => {
              console.log(resp.id);
              // this._storage.set('PersonalID',resp.id);
              this.FormCreateFamilyHead.reset();
              this.GetMembers();
            }).catch(error => {
              console.log(error);
            });
            mobileexist.unsubscribe();
          }
          else {
            alert('Already exist user');
            this.FormCreateFamilyHead.reset();
            mobileexist.unsubscribe();
          }
        })
      } else {
        alert('Already exist user');
        this.FormCreateFamilyHead.reset();
        userexist.unsubscribe();
      }

    })


    // this.firebaseService.create_Member(dataobj).then(resp => {
    //   console.log(resp.id);
    //  // this._storage.set('PersonalID',resp.id);
    //   this.FormCreateFamilyHead.reset();
    // })
    //   .catch(error => {
    //     console.log(error);
    //   });

  }

  //  async OnclickMember(m){
  //    console.log(m);
  // //   let name = await this._storage.set("name_user",m.Name);
  // // let ID = await this._storage.set("fcmID",m.id);
  // // let uname = await this._storage.set("Current_uname",m.username);

  // //     //console.log(name,ID,uname);
  // //     this.route.navigate(['/expenses/'+ID]);
  //   }
  async Delete(M) {
    try {
      let member = M ;
      console.log('delete to be',JSON.stringify(member));
      if (member.ishead === 'false') {
        let actionSheet = await this.actionSheetCtrl.create({
          header: 'Are you sure, you wants to delete this member?',
          buttons: [{
            text: 'Delete',
            handler:async () => {
              member.isDelete = true;
              member.Syncdate= parseInt((new Date(new Date().toUTCString()).getTime()/1000).toFixed(0));
              this.firebaseService.update_Member(M.id, member);
              let navTransition = actionSheet.dismiss();
              member.MFCM_ID = member.id;
              await this.db.UpdateMember(member).then(()=>{
                this.GetMembers();
              });
              return false;
            },
          },
          {
            text: 'No keep it!',
            handler: () => {
              let navTransition = actionSheet.dismiss();
              return false;
            },
          }]
        });

        await actionSheet.present();
      }
      else {
        alert('Sorry, you tried to delete Head user 😱😱😱');
      }

    } catch (error) {
      console.log(error);
    }
  }
  
 async Sharekey(){

    try {
      await Share.share({
        //title: 'Hey, Try out this Expense Manager App',
        text: this.Familykey+' will be your key to get start, Try this out new amazing Expense Manager app',
        url: 'https://play.google.com/store/apps/details?id=com.vj.familyexpense',
      });
    } catch (error) {
      
    }
  }

  async Action(m){
    console.log(JSON.stringify(m));
    let member = m;
    if(m.ishead === 'false'){

      let actionSheet = await this.actionSheetCtrl.create({
        header: 'Are you sure, you wants to make this member as head?',
        buttons: [{
          text: 'Yes',
          handler:async () => {
            member.ishead = true;
            member.Syncdate= parseInt((new Date(new Date().toUTCString()).getTime()/1000).toFixed(0));
            this.firebaseService.update_Member(m.id, member);
            this.GetMembers();
            let navTransition = actionSheet.dismiss();
            member.MFCM_ID = member.id;
            // await this.db.UpdateMember(member).then(()=>{
            //   this.GetMembers();
            // });
            return false;
          },
        },
        {
          text: 'No',
          handler: () => {
            let navTransition = actionSheet.dismiss();
            return false;
          },
        }]
      });
      
      await actionSheet.present();
    }else{
      let actionSheet = await this.actionSheetCtrl.create({
        header: 'Are you sure, you wants to remove this user from head?',
        buttons: [{
          text: 'Yes',
          handler:async () => {
            member.ishead = false;
            member.Syncdate= parseInt((new Date(new Date().toUTCString()).getTime()/1000).toFixed(0));
            this.firebaseService.update_Member(m.id, member);
            let navTransition = actionSheet.dismiss();
            member.MFCM_ID = member.id;
            this.GetMembers();
            // await this.db.UpdateMember(member).then(()=>{
            //   this.GetMembers();
            // });
            return false;
          },
        },
        {
          text: 'No',
          handler: () => {
            let navTransition = actionSheet.dismiss();
            return false;
          },
        }]
      });
      await actionSheet.present();
    }

    
  }

}
