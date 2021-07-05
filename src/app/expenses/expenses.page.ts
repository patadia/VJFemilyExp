import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { IonRouterOutlet, Platform, PopoverController, ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CPopoverComponent } from '../cpopover/cpopover.component';
import { FirebaseService } from '../services/firebase.service';
import { StorageService } from '../services/storage.service';
import { DatePipe } from '@angular/common';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { ExpenseAddPopupPage } from '../expense-add-popup/expense-add-popup.page';
import { DataService, TExpenes } from '../services/data.service';
import { FilterPagePage } from '../filter-page/filter-page.page';
import {Ng2ImgMaxService} from 'ng2-img-max'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})


export class ExpensesPage implements OnInit {
  private routeSub: Subscription;
  name: string = '';
  monthDate: any = new Date().toISOString();
  datepick: any;
  public ExpennseList: any = [];
  Creditbal: any = 0.0;
  Debitbal: any = 0.0;
  paramID: string = '';
  setdate: any;
  private readExpdataSub: Subscription;
  private expenseFetchsub: Subscription;
  private Fkey: string;
  Syncdate: any;
  TotalCreditbal : any = 0.0;
  TotalDebitbal : any = 0.0;
  ShowPbalance:boolean = false;
  slideOpts = {
    slidesPerView: 3,
    spaceBetween: 0
  };
  constructor(private route: ActivatedRoute,
    private popover: PopoverController,
    private fire: FirebaseService,
    private Store: StorageService,
    public datepipe: DatePipe,
    private platform: Platform,
    private rou: Router,
    private routerOutlet: IonRouterOutlet,
    private actionSheetCtrl: ActionSheetController,
    private db: DataService,
    private conimg : Ng2ImgMaxService
  ) {
    this.Store.init().then(() => {

      this.init();
    })
    //let datelog = document.getElementById('pickdate');
    this.datepick = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    console.log('date new', this.datepick);
    this.setdate = new Date(this.datepick);

  }

  async init() {


    this.name = await this.Store.GetStorevalue('name_user');
    this.Fkey = await this.Store.GetStorevalue('familykeyID');
    let Pbal = await this.Store.GetPbalFlag();
    this.ShowPbalance = Pbal;
    this.getdata_expense('');
    let nedate = new Date(this.datepick);
    this.GetDBexpense(nedate.getFullYear(), nedate.getMonth(), this.Fkey);
  }
  GetDBexpense(Year: any, month: any, Fkey: string) {
    console.log('date retrive', Year + '' + month + '' + Fkey);
    this.expenseFetchsub = this.db.fetchExpenses(Year, month, Fkey).subscribe((data) => {
      console.log(JSON.stringify(data))
      this.Creditbal = 0.0;
      this.Debitbal = 0.0;
      this.ExpennseList = [];
      data.forEach(e => {
        let pusher = {
          id: e.EFCM_ID,
          Title: e.Title,
          Amount: e.Amount,
          Transaction_Type: e.Transaction_type,
          date_on: e.date_on,
          Date_unix: e.Date_unix,
          byName: e.byName,
          Syncdate: e.Syncdate,
          isDelete: e.isDelete,
          Images : e.Images,
          Type_expense: e.Type_expense
        }
        this.ExpennseList.push(pusher);
        console.log(JSON.stringify(pusher));
        if (e.Transaction_type == 'debit') {
          this.Debitbal += e.Amount;
        }
        else {
          this.Creditbal += e.Amount;
        }

      })
    })
  }

  // async Logout() {
  //   console.log('logout');
  //   await this._storage.clear();
  //   this.rou.navigate(['./home']);
  // }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      console.log(params) //log the entire params object
      console.log(params['ID']) //log the value of id
      this.paramID = params['ID'];

      console.log('initcall');
    });
  }

 async ReadExpense_filter(){
   console.log('date for datepick',this.datepick)
  let Month =  new Date(this.datepick).getMonth();
  let year = new Date(this.datepick).getFullYear();
  let month = Month;
  const start = new Date(year, month, 1);
  const daysinmonth = new Date(year, month + 1, 0).getDate();
  const end = new Date(year, month, daysinmonth, 23, 59, 59);
  let start_unix = parseInt((start.getTime() / 1000).toFixed(0));
  let End_unix = parseInt((end.getTime() / 1000).toFixed(0));
    let _data = {
      Sdate : start_unix,
      Edate: End_unix,
      ByName : '',
      FamilyKey : this.Fkey
    }
    // console.log(_data);

    await this.db.FilterExpense(_data);
    this.TOTAL_bal();
  }
 
  async TOTAL_bal(){
    this.db.FetchexpensesTotalbalCred(this.Fkey).subscribe((data)=>{
      console.log(JSON.stringify(data));
      this.TotalCreditbal = data;
    })
    this.db.FetchexpensesTotalbalDebit(this.Fkey).subscribe((data)=>{
      console.log(JSON.stringify(data));
      this.TotalDebitbal = data;
    })

  }
  async getdata_expense(ID) {
    try {
      this.Syncdate = Number(await this.Store.GetSyncDate('Expense'));
      console.log(this.Fkey);
      //this.ExpennseList = [];
      console.log('getdata_call');
      let nedate = new Date(this.datepick);

      //read_expense_Sync
      // this.readExpdataSub = this.fire.Read_expbyMonth(nedate.getFullYear(), nedate.getMonth(),this.Fkey).subscribe((edata: any) => {
      this.readExpdataSub = this.fire.read_expense_Sync(this.Syncdate, this.Fkey).subscribe((edata: any) => {
        console.log('check', edata);
        //this.ExpennseList = [];
        // this.Creditbal = 0.0;
        // this.Debitbal = 0.0;
        edata.forEach(e => {
          let deleteLog = false;
          console.log(e.isDelete);
          if (e.isDelete !== undefined) {
            deleteLog = e.isDelete;
          }
          let image = 0
          if(e?.Images){
            image = e.Images
          }
          let Type_expenses = 'default';
          if(e.Type_expense !== undefined){
            Type_expenses = e.Type_expense;
          }
          let pusher: TExpenes = {
            // EFCM_ID: e.payload.doc.id,
            // Title: e.payload.doc.data()['Title'],
            // Amount: Number(e.payload.doc.data()['Amount']),
            // Transaction_type: e.payload.doc.data()['Transaction_Type'],
            // date_on: e.payload.doc.data()['date_on'],
            // Date_unix: Number(e.payload.doc.data()['Date_unix']),
            // byName: e.payload.doc.data()['byName'],
            // Syncdate: Number(e.payload.doc.data()['Syncdate']),
            //  FamilyKey : this.Fkey,
            //  isDelete:false,
            //  id:0
            EFCM_ID: e.id,
            Title: e.Title,
            Amount: Number(e.Amount),
            Transaction_type: e.Transaction_Type,
            date_on: e.date_on,
            Date_unix: Number(e.Date_unix),
            byName: e.byName,
            Syncdate: Number(e.Syncdate),
            FamilyKey: this.Fkey,
            isDelete: deleteLog,
            Images : image,
            id: 0,
            Type_expense:Type_expenses
          }
          //this.ExpennseList.push(pusher);
          this.db.AddExpense(pusher as TExpenes).then(() => {
            console.log('Exp added ', JSON.stringify(pusher))
          })
          // if (e.payload.doc.data()['Transaction_Type'] == 'debit') {
          //   this.Debitbal += parseFloat(e.payload.doc.data()['Amount']);
          // }
          // else {
          //   this.Creditbal += parseFloat(e.payload.doc.data()['Amount']);
          // }
        });

        if (edata.length > 0) {
          this.Subscription_release();
          // this.expenseFetchsub.unsubscribe();
          var setnew = this.Store.SetSyncDate(new Date(), 'Expense');
          //console.log(setnew);
          this.ExpenseReset();
        }

       // this.db.ReadExpense(nedate.getFullYear(), nedate.getMonth(), this.Fkey);
        this.ReadExpense_filter();
        // this.GetDBexpense(nedate.getFullYear(), nedate.getMonth(), this.Fkey);

      })

    } catch (error) {
      console.log(error);
    }
  }

  async ExpenseReset() {
    let nedate = new Date(this.datepick);
    setTimeout(() => {
      this.getdata_expense('');
    },
      1500);
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.Subscription_release();
    this.expenseFetchsub.unsubscribe();
  }
  async getdate() {
    var datetoday = new Date().toISOString();
    console.log(datetoday);
    return datetoday;
  }

  async add_new_data() {
    // this.ExpennseList.push({
    //   byname:'j',
    //   edate:this.getdate(),
    //   amount:'100',
    //   title:'credited',
    //   transactiontype:'income'
    // });

    const popo = await this.popover.create({
      component: ExpenseAddPopupPage,
      cssClass: 'my-custom-class'
    })
    popo.onDidDismiss().then((data: any) => {
      console.log(JSON.stringify(data.data));
      if (data.data?.Add_data) {
        console.log(data.data?.Add_data);

        //this.ExpennseList.push(data.data.Add_data);
        this.Create_newdata(data.data.Add_data);
      }

      if (data.data?.Edit_data) {

        console.log(data.data?.Edit_data);

        this.Edit_Expensedata(data.data.Edit_data);
      }
      //console.log(this.ExpennseList);
    });
    return await popo.present();
  }

  

  async Edit_Expensedata(expense: any) {
    let check = await this.Store.GetStorevalue('ISKeyUser');
    let checkname = await this.Store.GetStorevalue('name_user')
    if (check === 'HeadLogedin' || checkname === expense.data.byName) {
      try {
        let actionSheet = await this.actionSheetCtrl.create({
          header: 'Are you sure, you wants to edit this expense?',
          buttons: [{
            text: 'Edit',
            handler: async () => {
              // expense.isDelete = true;
              //expense.Syncdate = parseInt((new Date().getTime()/1000).toFixed(0))
              var del = await this.fire.update_Expense(expense.data);
              this.Editimages(expense);
              // this.Subscription_release();
              //this.getdata_expense(this.paramID);
              // this.db.UpdateExpense_edit(expense).then(() => {
              //   console.log('edited', expense.id);
              // });
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
      } catch (error) {
        console.log(error);
      }
    }else{
      alert('You do not have permission to edit other members expense data');
    }
    //update in firebase





  }

  Editimages(imgdata : any){
    try {
      if(imgdata.images?.photoes.length > 0){
        let pics = imgdata.images.photoes.filter(i=> i.type === 'dataurl');
        if(pics.length > 0){

          this.uploadAttachment(pics,imgdata.data.id);
        } 
      }

      if(imgdata.images?.delphotoes.length > 0){
        let delpics = imgdata.images.delphotoes.filter(i=> i.type === 'frombase');
        delpics.forEach(e => {
         let del =  this.fire.deleteattachement(imgdata.data.id,e.filename);
         console.log(del);
        });
      }

    } catch (error) {
      console.log(error);
    }
  }

  Create_newdata(Add_data: any) {
    try {
      // console.log('imagealist',Add_data?.images.photoes.length);
      // if(Add_data.images.photoes.length >0){
      //       this.uploadAttachment(Add_data.images.photoes)
      //     }
      this.fire.Create_expense(Add_data.data).then((data) => {
        console.log('add data', data);
       // console.log('imagealist',Add_data?.images);
        if(Add_data?.images?.photoes.length >0){
          this.uploadAttachment(Add_data.images.photoes,data.id)
        }
        //  this.getdata_expense(this.paramID);
      });
    } catch (error) {
      console.log(error)
    }
  }


 async uploadAttachment(IMAGE_data:any,id){
    try {
      IMAGE_data.forEach(i => {
       
        // console.log(i.image.changingThisBreaksApplicationSecurity);
        let imblob = dataURItoBlob(i.image.changingThisBreaksApplicationSecurity);
        var file = new File([imblob],new Date().getTime().toString()+'.png',{type: 'image/png'});
        this.conimg.compressImage(file,0.070).subscribe(res=>{
          let files = new File([res],res.name);
          console.log(files);
          this.fire.UploadBlobs(files,id);
        });
       // console.log(imblob);
      
      });
    } catch (error) {
      console.log(error);
    }
  }

  ChangedDate(Monthdater) {
    console.log('datechanges')
    //this.Subscription_release();
    // this.getdata_expense(this.paramID);


  }

  Subscription_release() {
    this.readExpdataSub.unsubscribe();

  }

  changenewdate(datepick) {
    console.log(datepick);
    this.setdate = new Date(datepick);
    console.log('datechanges_picker', this.setdate);
    //this.Subscription_release();
    //this.getdata_expense(this.paramID);
    let nedate = new Date(this.datepick);
    //this.db.ReadExpense(nedate.getFullYear(), nedate.getMonth(), this.Fkey);
    this.ReadExpense_filter();
  }

  opendatepicker() {

  }

  async Delete(expense) {
    let check = await this.Store.GetStorevalue('ISKeyUser');
    if (check === 'HeadLogedin') {
      console.log(expense);
      try {
        let actionSheet = await this.actionSheetCtrl.create({
          header: 'Are you sure, you wants to delete this expense?',
          buttons: [{
            text: 'Delete',
            handler: async () => {
              expense.isDelete = true;
              expense.Syncdate = parseInt((new Date().getTime() / 1000).toFixed(0))
              var del = await this.fire.update_Expense(expense);
              // this.Subscription_release();
              //this.getdata_expense(this.paramID);
              this.db.UpdateExpense(expense.id).then(() => {
                console.log('delete', expense.id);
              });
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
      } catch (error) {
        console.log(error);
      }
    } else {
      alert('You do not have permission to delete!');
    }

  }

  async View(e) {
    const popo = await this.popover.create({
      component: ExpenseAddPopupPage,
      cssClass: 'my-custom-class',
      componentProps: {
        'ExpenseData': e
      }
    });
    popo.onDidDismiss().then((data: any) => {
      console.log(JSON.stringify(data.data));
      if (data.data?.Edit_data) {
        console.log(data.data?.Edit_data);
        this.Edit_Expensedata(data.data.Edit_data);
      }
      //console.log(this.ExpennseList);
    });
    return await popo.present();

  }

async  Refresh_items() {

    let nedate = new Date(this.datepick);
    //this.expenseFetchsub.unsubscribe();
    this.Subscription_release();
    // this.db.ReadExpense(nedate.getFullYear(), nedate.getMonth(), this.Fkey);
    this.getdata_expense('');
    this.ShowPbalance = await this.Store.GetPbalFlag();
  }

  ExpenseList(event) {

    console.log('Begin refresh operation');

    setTimeout(() => {
      this.Refresh_items();
      event.target.complete();
    }, 1000);
  }


 async Filter_items(){

    const popo = await this.popover.create({
      component: FilterPagePage,
      componentProps: {
      }
    });
    popo.onDidDismiss().then(async (data: any) => {
      console.log(JSON.stringify(data.data?.Filterdata));
      if(data.data?.Filterdata){
        let startobj = new Date(data.data?.Filterdata.Sdate);
        let startobjdec = new Date(startobj.getFullYear(),startobj.getMonth(),startobj.getDate(),0,0,0)
        let endobj = new Date(data.data?.Filterdata.Edate);
        let Endobjdec = new Date(endobj.getFullYear(),endobj.getMonth(),endobj.getDate(),23,59,59);

        let sdate = parseInt((new Date(startobjdec).getTime() / 1000).toFixed(0));
        let edate = parseInt((new Date(Endobjdec).getTime() / 1000).toFixed(0));
        let Name = '';
        if(data.data?.Filterdata.Bynameselect !== 'default'){
          Name = data.data?.Filterdata.Bynameselect;
            // console.log('name of selected membetr -- >    >> ',Name);
        }


        let _data = {
          Sdate : sdate,
          Edate: edate,
          ByName : Name,
          FamilyKey : this.Fkey
        }
        // console.log(_data);

        await this.db.FilterExpense(_data);
      }

    });
    return await popo.present();
  }

}


function dataURItoBlob(dataURI) {

  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], {type: mimeString});
  return blob;

}







