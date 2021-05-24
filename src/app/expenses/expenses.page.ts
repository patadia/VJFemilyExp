import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CPopoverComponent } from '../cpopover/cpopover.component';
import { FirebaseService } from '../services/firebase.service';
import{Storage} from '@ionic/storage';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})


export class ExpensesPage implements OnInit {
  private routeSub: Subscription;
  name:string ='';
  private _storage: Storage | null = null;
  monthDate: any = new Date().toISOString();
  public ExpennseList:any = [];
  Creditbal:any= 0.0;
  Debitbal:any = 0.0;
  paramID :string = '';

  constructor(private route: ActivatedRoute,
    private popover: PopoverController,
    private fire:FirebaseService,
    private storage:Storage
    ) {
      this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    this.name =  await this._storage?.get('name_user');

 
  }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      console.log(params) //log the entire params object
      console.log(params['ID']) //log the value of id
      this.paramID= params['ID'];
      this.getdata_expense(params['ID']);
    });
  }

  getdata_expense(ID){
    try {
      this.ExpennseList = [];
      this.fire.read_expense().subscribe((data)=> {
        this.ExpennseList =  data.map(e => {
           return {
             id: e.payload.doc.id,
             Title: e.payload.doc.data()['Title'],
             Amount: e.payload.doc.data()['Amount'],
             Transaction_Type: e.payload.doc.data()['Transaction_Type'],
             date_on:e.payload.doc.data()['date_on'],
             byName:e.payload.doc.data()['byName'],
             Date_unix:e.payload.doc.data()['Date_unix']
           };
         })
         this.Creditbal = 0.0;
         this.Debitbal = 0.0;
         this.ExpennseList.forEach(element => {
          console.log(element)
          if(element.Transaction_Type == 'debit'){
            this.Debitbal+= parseFloat(element.Amount);
          }
          else{
            this.Creditbal +=parseFloat(element.Amount);
          }
        });
       });

       let nedate = new Date(this.monthDate);

       this.fire.Read_expbyMonth(nedate.getFullYear(),nedate.getMonth()).subscribe((edata)=>{
          console.log('check',edata);
       })
      
    } catch (error) {
      console.log(error);
    }
  }
  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
async getdate(){
   var datetoday = new Date().toISOString();
   console.log(datetoday);
return datetoday;
  }

 async add_new_data(){
    // this.ExpennseList.push({
    //   byname:'j',
    //   edate:this.getdate(),
    //   amount:'100',
    //   title:'credited',
    //   transactiontype:'income'
    // });
    
  const popo = await this.popover.create({
    component:CPopoverComponent
  })
  popo.onDidDismiss().then((data:any)=>{
    console.log(data.data.Add_data);
    //this.ExpennseList.push(data.data.Add_data);
    this.Create_newdata(data.data.Add_data);
    //console.log(this.ExpennseList);
  });
  return await popo.present();  
  }

  Create_newdata(Add_data: any) {
    try {
       this.fire.Create_expense(Add_data).then((data)=>{
          console.log(data);
         this.getdata_expense(this.paramID);
        
       });
    } catch (error) {
      console.log(error)
    }
  }

}




 

