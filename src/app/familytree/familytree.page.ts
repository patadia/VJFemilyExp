import { Component, OnInit } from '@angular/core'
import { FirebaseService } from '../services/firebase.service';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import{StorageService} from '../services/storage.service';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
interface Familytree {
  Name: string;
  username: number;
  ishead: boolean;
  isDelete:boolean;
}

@Component({
  selector: 'app-familytree',
  templateUrl: './familytree.page.html',
  styleUrls: ['./familytree.page.scss'],
})
export class FamilytreePage implements OnInit {
  
  public Familykey:string = '';
  Members = [];
  _familydata: Familytree;
  FormCreateFamilyHead: FormGroup;
  constructor(private firebaseService:FirebaseService,
    public fb: FormBuilder,
   public Store:StorageService,
    private route:Router,
    public actionSheetCtrl:ActionSheetController
    ) {
      this._familydata = {} as Familytree;
      this.Store.init().then(()=>{

        this.init();
      })
      
     }

     async init() {
      // If using, define drivers here: await this.storage.defineDriver(/*...*/);
     
      this.Familykey =  await this.Store.GetStorevalue('familykeyID');

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
              username: e.payload.doc.data()['username'],
              ishead: e.payload.doc.data()['ishead']
              
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
      FamilyKey : this.Familykey,
      isDelete :false
      //ishead:true
    })
    
  }

  ngOnDestroy() {
   
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

//  async OnclickMember(m){
//    console.log(m);
// //   let name = await this._storage.set("name_user",m.Name);
// // let ID = await this._storage.set("fcmID",m.id);
// // let uname = await this._storage.set("Current_uname",m.username);

// //     //console.log(name,ID,uname);
// //     this.route.navigate(['/expenses/'+ID]);
//   }
 async Delete(M){
    try {
      let member = M as Familytree;
      console.log(member);
      if(!member.ishead){
      let actionSheet =await this.actionSheetCtrl.create({
       header:'Are you sure, you wants to delete this member?',
        buttons: [{
            text: 'Delete',
            handler: () => {
              
      member.isDelete = true;
      this.firebaseService.update_Member(M.id,member);
                let navTransition = actionSheet.dismiss();
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
        else{
          alert('Sorry, you tried to delete Head user 😱😱😱');
        }
      
    } catch (error) {
      console.log(error);
    }
  }

}
