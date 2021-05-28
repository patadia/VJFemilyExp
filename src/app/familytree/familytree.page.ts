import { Component, OnInit } from '@angular/core'
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import{Storage} from '@ionic/storage';
import { Router } from '@angular/router';
interface Familytree {
  Name: string;
  username: number;
  ishead: boolean;
}

@Component({
  selector: 'app-familytree',
  templateUrl: './familytree.page.html',
  styleUrls: ['./familytree.page.scss'],
})
export class FamilytreePage implements OnInit {
  private _storage: Storage | null = null;
  public Familykey:string = '';
  Members = [];
  _familydata: Familytree;
  FormCreateFamilyHead: FormGroup;
  constructor(private firebaseService:FirebaseService,
    public fb: FormBuilder,private storage:Storage,private route:Router) {
      this._familydata = {} as Familytree;
      this.init();
      
     }

     async init() {
      // If using, define drivers here: await this.storage.defineDriver(/*...*/);
      const storage = await this.storage.create();
      this._storage = storage;
      this.Familykey =  await this._storage?.get('familykeyID');

      this.GetMembers();
    }
    GetMembers(){
      try{
        this.firebaseService.read_Memberss(this.Familykey).subscribe((data)=> {
          console.log(data);
         this.Members =  data.map(e => {
            return {
              id: e.payload.doc.id,
              
              Name: e.payload.doc.data()['Name'],
              username: e.payload.doc.data()['username']
            };
          })
          console.log(this.Members);
        })
      }catch(e){
        console.log(e);
      }
    }
 async ngOnInit() {
    this.FormCreateFamilyHead = this.fb.group({
      Name: new FormControl('',Validators.required),
      username: new FormControl('',Validators.required),
      FamilyKey : this.Familykey
      //ishead:true
    })
    
  }

  CreateRecord() {
    console.log(this.FormCreateFamilyHead.value);
    this.FormCreateFamilyHead.value.FamilyKey = this.Familykey;
    this.firebaseService.create_Member(this.FormCreateFamilyHead.value).then(resp => {
      console.log(resp.id);
     // this._storage.set('PersonalID',resp.id);
      this.FormCreateFamilyHead.reset();
    })
      .catch(error => {
        console.log(error);
      });
  }

 async OnclickMember(m){
   console.log(m);
//   let name = await this._storage.set("name_user",m.Name);
// let ID = await this._storage.set("fcmID",m.id);
// let uname = await this._storage.set("Current_uname",m.username);

//     //console.log(name,ID,uname);
//     this.route.navigate(['/expenses/'+ID]);
  }

}
