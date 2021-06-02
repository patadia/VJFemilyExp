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

  constructor(private route: ActivatedRoute,
    private popover: PopoverController,
    private fire: FirebaseService,
    private Store: StorageService,
    public datepipe: DatePipe,
    private platform: Platform,
    private rou: Router,
    private routerOutlet: IonRouterOutlet,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.Store.init().then(() => {

      this.init();
    })
    //let datelog = document.getElementById('pickdate');
    this.datepick = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    console.log('date new', this.datepick);
    this.setdate = new Date(this.datepick);

    this.platform.backButton.subscribeWithPriority(-1, () => {
      if (this.routerOutlet.canGoBack()) {
        App.exitApp();
      }
    });
  }

  async init() {


    this.name = await this.Store.GetStorevalue('name_user');
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
      this.getdata_expense(params['ID']);
      console.log('initcall');
    });
  }

  getdata_expense(ID) {
    try {
      this.ExpennseList = [];
      // this.fire.read_expense().subscribe((data)=> {
      //   // this.ExpennseList =  data.map(e => {
      //   //    return {
      //   //      id: e.payload.doc.id,
      //   //      Title: e.payload.doc.data()['Title'],
      //   //      Amount: e.payload.doc.data()['Amount'],
      //   //      Transaction_Type: e.payload.doc.data()['Transaction_Type'],
      //   //      date_on:e.payload.doc.data()['date_on'],
      //   //      byName:e.payload.doc.data()['byName'],
      //   //      Date_unix:e.payload.doc.data()['Date_unix']
      //   //    };
      //   //  })
      //   console.log('document load',data);
      //  });
      console.log('getdata_call');
      let nedate = new Date(this.datepick);

      this.readExpdataSub = this.fire.Read_expbyMonth(nedate.getFullYear(), nedate.getMonth()).subscribe((edata: any) => {
        console.log('check', edata);
        this.ExpennseList = [];
        this.Creditbal = 0.0;
        this.Debitbal = 0.0;
        edata.forEach(e => {
          let pusher = {
            id: e.payload.doc.id,
            Title: e.payload.doc.data()['Title'],
            Amount: e.payload.doc.data()['Amount'],
            Transaction_Type: e.payload.doc.data()['Transaction_Type'],
            date_on: e.payload.doc.data()['date_on'],
            Date_unix: e.payload.doc.data()['Date_unix'],
            full_date: e.payload.doc.data()['full_date'],
            byName: e.payload.doc.data()['byName'],
          }
          this.ExpennseList.push(pusher);
          if (e.payload.doc.data()['Transaction_Type'] == 'debit') {
            this.Debitbal += parseFloat(e.payload.doc.data()['Amount']);
          }
          else {
            this.Creditbal += parseFloat(e.payload.doc.data()['Amount']);
          }
          //  this.Subscription_release();
        });

      })

    } catch (error) {
      console.log(error);
    }
  }
  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.Subscription_release();
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
      component: CPopoverComponent
    })
    popo.onDidDismiss().then((data: any) => {
      console.log(data.data.Add_data);
      //this.ExpennseList.push(data.data.Add_data);
      this.Create_newdata(data.data.Add_data);
      //console.log(this.ExpennseList);
    });
    return await popo.present();
  }

  Create_newdata(Add_data: any) {
    try {
      this.fire.Create_expense(Add_data).then((data) => {
        console.log('add data', data);
        //  this.getdata_expense(this.paramID);

      });
    } catch (error) {
      console.log(error)
    }
  }

  ChangedDate(Monthdater) {
    console.log('datechanges')
    this.Subscription_release();
    this.getdata_expense(this.paramID);
  }

  Subscription_release() {
    this.readExpdataSub.unsubscribe();
  }

  changenewdate(datepick) {
    console.log(datepick);
    this.setdate = new Date(datepick);
    console.log('datechanges_picker', this.setdate);
    this.Subscription_release();
    this.getdata_expense(this.paramID);
  }

  opendatepicker() {

  }

  async Delete(id) {
    let check = await this.Store.GetStorevalue('ISKeyUser');
    if (check === 'HeadLogedin') {
      console.log(id);
      try {
        let actionSheet = await this.actionSheetCtrl.create({
          header: 'Are you sure, you wants to delete this expense?',
          buttons: [{
            text: 'Delete',
            handler: async() => {

              var del = await this.fire.delete_Expense(id);
              this.Subscription_release();
              this.getdata_expense(this.paramID);
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

}







