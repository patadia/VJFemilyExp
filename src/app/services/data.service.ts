import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx'



export interface TMember {
  id: number,
  m_name: string,
  Email: string,
  Mobile: string,
  MFCM_ID: string,
  ishead: boolean,
  FamilyKey: string,
  isDelete: boolean,
  Syncdate: string,
  IsMaster:boolean
}
export interface TExpenes {
  id: number,
  EFCM_ID: string,
  Title: string,
  Amount: number,
  Transaction_type: string,
  date_on: string,
  Date_unix: number,
  byName: string,
  FamilyKey: string,
  isDelete: boolean,
  Syncdate: number,
  Images:number,
  Type_expense:string,
  RecurrentEvent:string
}

export interface TNotification{
  id:number,
  EFCM_ID:string,
  Type:string,
  NotifyNo:number,

}

export interface TName{
  byName:string;
}

export interface TType_Exp{
  Type:string,
  Syncdate:string
}

export interface typeexp{
  Type:string;
}



@Injectable({
  providedIn: 'root'
})
export class DataService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  Members = new BehaviorSubject([]);
  Expenses = new BehaviorSubject([]);
  Name_member = new BehaviorSubject([]);
  Types_exp = new BehaviorSubject([]);
  Totalcredit = new BehaviorSubject([]);
  Totaldebit = new BehaviorSubject([]);
  
  constructor(private plt: Platform,
    private sqlitePorter: SQLitePorter,
    private sqlite: SQLite,
    private Lnoti:LocalNotifications) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'emdbv1.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          console.log(db)
          this.database = db;
          this.CreateDatabase();
        });
    });
  }

  CreateDatabase() {
    try {
      let sql = 'create table IF NOT EXISTS MembersData (id integer primary key AUTOINCREMENT,m_name Text,Email Text,Mobile Text,MFCM_ID Text,ishead boolean,FamilyKey Text,isDelete boolean,Syncdate string,IsMaster boolean);';
      sql = sql + 'create table IF NOT EXISTS ExpenseData (id integer primary key Autoincrement,EFCM_ID Text,Title Text,Amount real,Transaction_type Text,date_on Text,Date_unix integer,byName Text,FamilyKey Text,isDelete boolean,Syncdate integer,Images integer,Type_expense Text,RecurrentEvent Text);';
      sql = sql + 'create table IF NOT EXISTS TypeExpense (id integer primary key Autoincrement,Type Text,Syncdate integer);';
      sql = sql + 'create table IF NOT EXISTS Notifications_Store (id integer primary key Autoincrement,Type Text,EFCM_ID Text,NotifyNo integer);';
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(_ => {
          this.dbReady.next(true);
          console.log('ready', _);
        })


    } catch (error) {
      console.log(error);
    }
  }

  ReadMember(familykey: string) {
    return this.database.executeSql('SELECT * FROM MembersData where isDelete = ? and FamilyKey = ? ', [false, familykey]).then(data => {
      let members: TMember[] = [];
      console.log('readsql', data);
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          var dataread = data.rows.item(i);
          console.log('readdata from rows', dataread);
          members.push({
            id: dataread.id,
            m_name: dataread?.m_name,
            Email: dataread.Email,
            MFCM_ID: dataread.MFCM_ID,
            FamilyKey: dataread.FamilyKey,
            Mobile: dataread.Mobile,
            ishead: dataread.ishead,
            isDelete: dataread.isDelete,
            Syncdate: dataread.Syncdate,
            IsMaster:dataread.IsMaster
          });
        }
      }
      console.log('total mem: ', members.length);
      this.Members.next(members);
    });
  }

  fetchMembers(FamilyKey: string): Observable<TMember[]> {
    this.ReadMember(FamilyKey);
    return this.Members.asObservable();
  }

  async AddMember(m: any) {
    try {
      if (!m?.Mobile)
        m.Mobile = '';
      if (!m?.ishead)
        m.ishead = false;
      if (!m?.isDelete)
        m.isDelete = false;
      let DataM = [m.m_name, m.Email, m.Mobile, m.MFCM_ID, m.ishead,m.IsMaster, m.FamilyKey, m.isDelete, m.Syncdate];
      console.log('add->member', DataM);

      let checkExist = await this.database.executeSql('select * from MembersData where MFCM_ID =?', [m.MFCM_ID]);
      console.log('read data from members ', JSON.stringify(checkExist));
      if (checkExist.rows.length > 0) {
        let DataMem_update = [m.isDelete, m.Syncdate, m.FamilyKey,m.m_name, m.Email, m.Mobile, m.ishead,m.IsMaster ,m.MFCM_ID];
        let stored = await this.database.executeSql(`Update MembersData set isDelete = ?,Syncdate = ?,FamilyKey =?,m_name=?,Email=?,Mobile = ?,ishead = ?,IsMaster = ? where MFCM_ID = ?`, DataMem_update)
        console.log('read data from update before add ', JSON.stringify(stored));
        //this.ReadMember(m.FamilyKey);
      }else{

        
        const data = await this.database.executeSql('INSERT OR IGNORE INTO MembersData (m_name,Email,Mobile,MFCM_ID,ishead,IsMaster,FamilyKey,isDelete,Syncdate) VALUES (?,?,?,?,?,?,?,?,?)', DataM).then(() => {
          
          this.ReadMember(m.FamilyKey);
        })
      }
      //console.log('return obj', data);
    } catch (error) {
      console.log(error);
    }
  }

  async UpdateMember(m: any) {
    try {
      let DataM = [m.isDelete, m.Syncdate, m.ishead,m.MFCM_ID];
      const data = await this.database.executeSql(`Update MembersData set isDelete = ?,Syncdate = ?,ishead = ? where MFCM_ID = ?`, DataM).then(() => {
        this.ReadMember(m.FamilyKey);
      })
    } catch (error) {
      console.log(error);
    }
  }

  ///////////
  //////Expense database operations
  //////
  //////////////
  fetchExpenses(Year: any, month: any, Fkey: string): Observable<TExpenes[]> {
    //this.ReadExpense(Year, month, Fkey);
    return this.Expenses.asObservable();
  }

  ReadExpense(year: number, Month: number, FamilyKey:string) {
    console.log('read exp');
    let month = Month;
    const start = new Date(year, month, 1);
    const daysinmonth = new Date(year, month + 1, 0).getDate();
    //console.log(daysinmonth,month,year);
    const end = new Date(year, month, daysinmonth, 23, 59, 59);
    //console.log(start);
    //console.log(end);
    //var start_u =  firebase.default.firestore.Timestamp.fromDate(start);
    //var end_u =  firebase.default.firestore.Timestamp.fromDate(end);
    let start_unix = parseInt((start.getTime() / 1000).toFixed(0));
    let End_unix = parseInt((end.getTime() / 1000).toFixed(0));
let datam = [false, start_unix, End_unix, FamilyKey];
console.log(JSON.stringify(datam));
   return this.database.executeSql('SELECT * FROM ExpenseData where isDelete = ? and Date_unix >= ? and Date_unix <= ? and FamilyKey = ? Order by Date_unix DESC', datam).then((data)=>{
   // return this.database.executeSql('SELECT * FROM ExpenseData').then((data)=>{

      let exp: TExpenes[] = [];
      console.log('readsql', JSON.stringify(data));
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          var dataread = data.rows.item(i);
          // console.log('readdata from rows', dataread);
          exp.push({
            id: dataread.id,
            Amount: dataread.Amount,
            Date_unix: dataread.Date_unix,
            EFCM_ID: dataread.EFCM_ID,
            FamilyKey: dataread.FamilyKey,
            Title: dataread.Title,
            Transaction_type: dataread.Transaction_type,
            byName: dataread.byName,
            date_on: dataread.date_on,
            isDelete: dataread.isDelete,
            Syncdate: dataread.Syncdate,
            Images: dataread.Images,
            Type_expense: dataread.Type_expense,
            RecurrentEvent:dataread.RecurrentEvent
          });
        }
      }
      console.log('Dataread --> exp-- > ', JSON.stringify(exp));
      this.Expenses.next(exp);
    });
  }


  async AddExpense(m: TExpenes) {
    try {

      //read data first 
      let checkExist = await this.database.executeSql('select * from ExpenseData where EFCM_ID =?', [m.EFCM_ID]);
      console.log('read data from addexpense ', JSON.stringify(checkExist));
      if (checkExist.rows.length > 0) {
        let DataM = [m.isDelete, m.Syncdate, m.Amount, m.Date_unix, m.FamilyKey, m.Title, m.Transaction_type, m.byName, m.date_on,m.Images,m.Type_expense,m.RecurrentEvent, m.EFCM_ID];
        let stored = await this.database.executeSql(`Update ExpenseData set isDelete = ?,Syncdate = ?,Amount =?,Date_unix =?,FamilyKey =?,Title =?,Transaction_type =?,byName =?,date_on=?,Images = ?,Type_expense = ? ,RecurrentEvent = ?  where EFCM_ID = ?`, DataM)
        console.log('read data from update before add ', JSON.stringify(stored));
        this.UpdateNotification(m.EFCM_ID,m.Title,m.RecurrentEvent);
      }
      else {
        let DataM = [m.Amount, m.Date_unix, m.EFCM_ID, m.FamilyKey, m.Title, m.Transaction_type, m.byName, m.date_on, m.isDelete, m.Syncdate,m.Images,m.Type_expense,m.RecurrentEvent];
        console.log('add->Expense', DataM);
        const data = await this.database.executeSql('INSERT OR IGNORE INTO ExpenseData (Amount,Date_unix,EFCM_ID,FamilyKey,Title,Transaction_type,byName,date_on,isDelete,Syncdate,Images,Type_expense,RecurrentEvent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', DataM).then(() => {
          console.log('data added expense');
          if (m.RecurrentEvent !== '')
            this.AddNotification(m.EFCM_ID, m.Title, m.RecurrentEvent);
        })
      }
      //console.log('return obj', data);
    } catch (error) {
      console.log(error);
    }
  }

  async UpdateNotification(EFCM_ID:string,Title:string,event_data:string){
    try{

    
      let DataNotify = [EFCM_ID+''];
      console.log('Notification update EFCM id---> >>>> ',JSON.stringify(DataNotify));
      let data_notify =  await this.database.executeSql(`SELECT * FROM Notifications_Store where EFCM_ID =?`, DataNotify).then(async(data) => {
        console.log('Notification Update',JSON.stringify(data));
        if (data.rows.length > 0) {
          let notifyupdate = data.rows.item(0);
          console.log('Notification Update 2---> ---> ', JSON.stringify(notifyupdate));
          if (notifyupdate.Type !== event_data) {
            this.Lnoti.clear(notifyupdate.NotifyNo);
            if(event_data !== '')
              this.GenerateNotification(notifyupdate.NotifyNo, Title, event_data);
            let updatedata = [event_data,EFCM_ID+''];
            let updatenotify = await this.database.executeSql('update Notifications_Store set Type =? where EFCM_ID =?',updatedata);
            console.log('Update notifications --> >> >>> ',JSON.stringify(updatenotify));
          }
        }
        else {
          if(event_data !== '')
            this.AddNotification(EFCM_ID, Title, event_data);
        }

      });
     }
      catch(error){
        console.error(JSON.stringify(error));
      }

  }

  async AddNotification(EFCM_ID:string,Title:string,event_data:string){
    try {

      if(event_data !== ''){
        let Notifynumber:number = Math.floor(100000 + Math.random() * 900000);
        let loadData = [event_data,Notifynumber,EFCM_ID];
        console.log(JSON.stringify(loadData));
          let insNotification = await this.database.executeSql('INSERT OR IGNORE INTO Notifications_Store (Type,NotifyNo,EFCM_ID) VALUES (?,?,?)',loadData).then((d)=>{
            console.log('notification Added',JSON.stringify(d));
            this.GenerateNotification(Notifynumber,Title,event_data);

          })
      }
      
    } catch (error) {
      console.error(JSON.stringify(error));
    }
  }

  GenerateNotification(NotifyNo:number,Title:string,Event_data:string){
    console.log('in generate Notification---------> with '+Event_data+ '-----------'+NotifyNo+'----------'+Title);
    try {
      let eventspliter = Event_data.split('-');
      let selectorEvent = eventspliter[0];
      let selectorData = eventspliter[1].split('>');
      switch (selectorEvent) {
        case "Week":
          let Week_day =  parseInt(selectorData[0]);
          let hour = parseInt(selectorData[1]);
          let min = parseInt(selectorData[2]);
          this.Lnoti.schedule({
            id: NotifyNo,
            text: `${Title}`,
            title: 'Recurring Event Reminder',
            trigger: { count:1, every: {weekday:Week_day, hour: hour, minute: min} },
            sound: 'notify'
          });
          let week_day2 =  parseInt(selectorData[0])=== 0 ? 6:parseInt(selectorData[0])-1;
          this.Lnoti.schedule({
            id: NotifyNo,
            text: `${Title}`,
            title: 'Recurring Event Reminder for tomorrow',
            trigger: { count:1, every: {weekday:week_day2,hour: hour, minute: min} },
            sound: 'notify'
          });

          console.log('Weekly --> ',Week_day,week_day2,hour,min)
          break;
        case "Month":
          let date_mon =  parseInt(selectorData[0]);
          let hour_m = parseInt(selectorData[1]);
          let min_m = parseInt(selectorData[2]);
          let date_mon2 = parseInt(selectorData[0]) <=3 ? 30 - parseInt(selectorData[0]) :  parseInt(selectorData[0]) -3;
          this.Lnoti.schedule({
            id: NotifyNo,
            text: `${Title}`,
            title: 'Recurring Event Reminder',
            trigger: {count:1, every: {day:date_mon, hour: hour_m, minute: min_m} },
            sound: 'notify'
          });
          this.Lnoti.schedule({
            id: NotifyNo,
            text: `${Title}`,
            title: 'Recurring Event Reminder for Upcomming day',
            trigger: {count:1, every: {day:date_mon2, hour: hour_m, minute: min_m} },
            sound: 'notify'
          });
          console.log('Month',date_mon,hour_m,min_m);
          break;
        case "Year":
          let date_mon_y =  parseInt(selectorData[0]);
          let Month_y = parseInt(selectorData[1]);
          let hour_y = parseInt(selectorData[2]);
          let min_y = parseInt(selectorData[3]);
          this.Lnoti.schedule({
            id: NotifyNo,
            text: `${Title}`,
            title: 'Recurring Event Reminder',
            trigger: {count:1, every: {month:Month_y, day:date_mon_y, hour: hour_y, minute: min_y} },
            sound: 'notify'
          });
          console.log('Year --> ..>>> ',date_mon_y,Month_y,hour_y,min_y);
          break;
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  async DeleteNotification(EFCM_ID:string){
    try{
        let deleteNotify = await this.database.executeSql('select * from Notifications_Store where EFCM_ID = ?',[EFCM_ID]).then(async(data)=>{
          if (data.rows.length > 0) {
            let notifyupdate = data.rows.item(0);
            this.Lnoti.clear(notifyupdate.NotifyNo);
            let markdel = await this.database.executeSql('delete from Notifications_Store where EFCM_ID = ?',[EFCM_ID]);
          }
        });
    }catch(error){
        console.log(error);
    }
  }

  async UpdateExpense(m: any) {
    try {
      let syncd = parseInt((new Date().getTime() / 1000).toFixed(0));
      let DataM = [true, syncd, m];
      const data = await this.database.executeSql(`Update ExpenseData set isDelete = ?,Syncdate = ? where EFCM_ID =?`, DataM).then(() => {
        this.DeleteNotification(m);
      })
    } catch (error) {
      console.log(error);
    }
  }

  async UpdateExpense_edit(m: any) {
    try {
      let DataM = [m.isDelete, m.Syncdate, m.Amount, m.Date_unix, m.FamilyKey, m.Title, m.Transaction_type, m.byName, m.date_on,m.Images,m.Type_expense,m.RecurrentEvent, m.EFCM_ID];
      console.log('edit->Expense  ',JSON.stringify(DataM));

      let stored = await this.database.executeSql(`Update ExpenseData set isDelete = ?,Syncdate = ?,Amount =?,Date_unix =?,FamilyKey =?,Title =?,Transaction_type =?,byName =?,date_on=?, Images = ?,Type_expense = ?,RecurrentEvent = ?  where EFCM_ID =?`, DataM)
      console.log(JSON.stringify('edit review ',stored));
    } catch (error) {
        console.log(error);
    }
  }


  async FilterExpense(f:any){
    try {
      let dataf = [f.FamilyKey,f.Sdate,f.Edate,false]
      return await this.database.executeSql(`select * from ExpenseData where FamilyKey =? and Date_unix >= ? and Date_unix <= ? and byName like '%${f.ByName}%' and isDelete = ? Order by Date_unix DESC`, dataf).then(data=>{
        let exp: TExpenes[] = [];
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            var dataread = data.rows.item(i);
            exp.push({
              id: dataread.id,
              Amount: dataread.Amount,
              Date_unix: dataread.Date_unix,
              EFCM_ID: dataread.EFCM_ID,
              FamilyKey: dataread.FamilyKey,
              Title: dataread.Title,
              Transaction_type: dataread.Transaction_type,
              byName: dataread.byName,
              date_on: dataread.date_on,
              isDelete: dataread.isDelete,
              Syncdate: dataread.Syncdate,
              Images : dataread.Images,
              Type_expense:dataread.Type_expense,
              RecurrentEvent:dataread.RecurrentEvent
            });
          }
        }
        this.Expenses.next(exp);
      });
    } catch (error) {
      console.log(error);
    }

  }

   Fetchnames(familykey:string): Observable<TName[]>{
    this.FetchMemberNames(familykey);
    return this.Name_member.asObservable();
  }
 FetchMemberNames(familyKey:string){
    try {
      console.log(familyKey);
      let datam = [familyKey];
      return this.database.executeSql(`select Distinct byName from ExpenseData where FamilyKey = ?`,datam).then((data)=>{
        let names : TName[] = [];
        console.log('in array names -> ',JSON.stringify(data));
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            var dataread = data.rows.item(i);
            names.push({
              byName :  dataread.byName,
            });
          }
        }
        this.Name_member.next(names);
        //return names;
      });
    } catch (error) {
      console.log(error);
    }
  }


  FetchTypesOfexpense():Observable<typeexp[]>{
    this.Read_Type_Exp();
    return this.Types_exp.asObservable();
  }

 async AddType_Expenses(m:TType_Exp){
    try {
      //read data first 
      let checkExist = await this.database.executeSql('select * from TypeExpense where Type =?', [m.Type]);
      console.log('read data from types ', JSON.stringify(checkExist));
      if (checkExist.rows.length > 0) {
        let DataM = [m.Type,m.Syncdate,m.Type];
        let stored = await this.database.executeSql(`Update TypeExpense set Type = ?, Syncdate = ? where Type=?`, DataM)
        console.log('read data from update before add ', JSON.stringify(stored));
      }
      else {
        let DataM = [m.Type,m.Syncdate];
       
        const data = await this.database.executeSql('INSERT OR IGNORE INTO TypeExpense (Type,Syncdate) VALUES (?,?)', DataM).then(() => {
          console.log('data added types');
        })
      }
      //console.log('return obj', data);
    } catch (error) {
      console.log(error);
    }
  }

 Read_Type_Exp(){
    try {
      return this.database.executeSql(`select distinct Type from TypeExpense`,[]).then(data=>{
        let tp:typeexp[] = [];
        console.log('types data',JSON.stringify(data));
        if (data.rows.length > 0) {
          for (var i = 0; i < data.rows.length; i++) {
            var dataread = data.rows.item(i);
            tp.push({
              Type:dataread.Type
            });
          }
        }
        this.Types_exp.next(tp);
      });
    } catch (error) {
      console.log(error);
    }
  }

  FetchexpensesTotalbalCred(Fkey:string):Observable<any[]>{
    this.CalculateCreditSumExpense(Fkey);
    //this.CalculatedebitSumExpense(Fkey);
 return this.Totalcredit.asObservable();
  }
  FetchexpensesTotalbalDebit(Fkey:string):Observable<any[]>{
    //this.CalculateCreditSumExpense(Fkey);
    this.CalculatedebitSumExpense(Fkey);
 return this.Totaldebit.asObservable();
  }

  CalculateCreditSumExpense(Fkey:string){
    try {

      let Month =  new Date().getMonth();
      let year = new Date().getFullYear();
      let month = Month -1;
      if(month === -1){
        year = year -1;
      }
      const start = new Date(year, month, 1);
      const daysinmonth = new Date(year, month + 1, 0).getDate();
      const end = new Date(year, month, daysinmonth, 23, 59, 59);
      let start_unix = parseInt((start.getTime() / 1000).toFixed(0));
      let End_unix = parseInt((end.getTime() / 1000).toFixed(0));

      return this.database.executeSql(`select SUM(Amount) as CreditBal from ExpenseData where FamilyKey = ? and Transaction_type = 'credit' and isDelete = ? and Date_unix >= ? and Date_unix <=?`,[Fkey,false,start_unix,End_unix]).then((data)=>{
          if(data.rows.length > 0){
            for (let i = 0; i < data.rows.length; i++) {
              var dataread = data.rows.item(i);
              console.log(JSON.stringify(dataread));
              this.Totalcredit.next(dataread.CreditBal);
            }
          }
      })
    } catch (error) {
      console.log(error);
    }
  }

  CalculatedebitSumExpense(Fkey:string){
    try {
      let Month =  new Date().getMonth();
      let year = new Date().getFullYear();
      let month = Month -1;
      if(month === -1){
        year = year -1;
      }
      const start = new Date(year, month, 1);
      const daysinmonth = new Date(year, month + 1, 0).getDate();
      const end = new Date(year, month, daysinmonth, 23, 59, 59);
      let start_unix = parseInt((start.getTime() / 1000).toFixed(0));
      let End_unix = parseInt((end.getTime() / 1000).toFixed(0));
      return this.database.executeSql(`select SUM(Amount) as DebitBal from ExpenseData where FamilyKey = ? and Transaction_type = 'debit' and isDelete = ?  and Date_unix >= ? and Date_unix <=?`,[Fkey,false,start_unix,End_unix]).then((data)=>{
          if(data.rows.length > 0){
            for (let i = 0; i < data.rows.length; i++) {
              var dataread = data.rows.item(i);
              console.log(JSON.stringify(dataread));
              this.Totaldebit.next(dataread.DebitBal);
            }
          }
      })
    } catch (error) {
      console.log(error);
    }
  }

  async GetdataAddedForPrebal(Fkey:string):Promise<any>{
    let Month =  new Date().getMonth();
      let year = new Date().getFullYear();
      let month = Month -1;
      if(month === -1){
        year = year -1;
      }
      const start = new Date(year, month, 1);
      const daysinmonth = new Date(year, month + 1, 0).getDate();
      const end = new Date(year, month, daysinmonth, 23, 59, 59);
      let start_unix = parseInt((start.getTime() / 1000).toFixed(0));
      let End_unix = parseInt((end.getTime() / 1000).toFixed(0));
  await this.database.executeSql(`select SUM(Amount) as CreditBal from ExpenseData where FamilyKey = ? and Transaction_type = 'credit' and isDelete = ? and Date_unix >= ? and Date_unix <=?`,[Fkey,false,start_unix,End_unix]).then( (data)=>{return data;});
      
}

}
