import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';


export interface TMember {
  id: number,
  m_name: string,
  Email: string,
  Mobile: string,
  MFCM_ID: string,
  ishead: boolean,
  FamilyKey: string,
  isDelete: boolean,
  Syncdate: string
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
  Syncdate: number
}




@Injectable({
  providedIn: 'root'
})
export class DataService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  Members = new BehaviorSubject([]);
  Expenses = new BehaviorSubject([]);
  constructor(private plt: Platform,
    private sqlitePorter: SQLitePorter,
    private sqlite: SQLite,
    private http: HttpClient) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'ExpensesSqlitedb.db',
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
      let sql = 'create table IF NOT EXISTS TMembersdata(id integer primary key AUTOINCREMENT,m_name Text,Email Text,Mobile Text,MFCM_ID Text,ishead boolean,FamilyKey Text,isDelete boolean,Syncdate string);';
      sql = sql + 'create table IF NOT EXIStS TExpensesData (id integer primary key Autoincrement,EFCM_ID Text,Title Text,Amount real,Transaction_type Text,date_on Text,Date_unix integer,byName Text,FamilyKey Text,isDelete boolean,Syncdate integer);'

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
    return this.database.executeSql('SELECT * FROM TMembersdata where isDelete = ? and FamilyKey = ? ', [false, familykey]).then(data => {
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
            Syncdate: dataread.Syncdate
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
      let DataM = [m.m_name, m.Email, m.Mobile, m.MFCM_ID, m.ishead, m.FamilyKey, m.isDelete, m.Syncdate];
      console.log('add->member', DataM);
      const data = await this.database.executeSql('INSERT OR IGNORE INTO TMembersdata (m_name,Email,Mobile,MFCM_ID,ishead,FamilyKey,isDelete,Syncdate) VALUES (?,?,?,?,?,?,?,?)', DataM).then(() => {

        this.ReadMember(m.FamilyKey);
      })
      //console.log('return obj', data);
    } catch (error) {
      console.log(error);
    }
  }

  async UpdateMember(m: any) {
    try {
      let DataM = [m.isDelete, m.Syncdate, m.MFCM_ID];
      const data = await this.database.executeSql(`Update TMembersdata set isDelete = ?,Syncdate = ? where MFCM_ID = ?`, DataM).then(() => {
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
    this.ReadExpense(Year, month, Fkey)
    return this.Expenses.asObservable();
  }

  ReadExpense(year: number, Month: number, FamilyKey) {

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

    return this.database.executeSql('SELECT * FROM TExpensesData where isDelete = ? and Date_unix >= ? and Date_unix <= ? and FamilyKey = ? Order by Date_unix DESC', [false, start_unix, End_unix, FamilyKey]).then(data => {
      let exp: TExpenes[] = [];
      //   console.log('readsql', data);
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
            Syncdate: dataread.Syncdate
          });
        }
      }
      // console.log('Dataread --> exp-- > ', JSON.stringify(exp));
      this.Expenses.next(exp);
    });
  }


  async AddExpense(m: TExpenes) {
    try {

      //read data first 
      let checkExist = await this.database.executeSql('select * from TExpensesData where EFCM_ID =?', [m.EFCM_ID]);
      console.log('read data from addexpense ', JSON.stringify(checkExist));
      if (checkExist.rows.length > 0) {
        let DataM = [m.isDelete, m.Syncdate, m.Amount, m.Date_unix, m.FamilyKey, m.Title, m.Transaction_type, m.byName, m.date_on, m.EFCM_ID];
        let stored = await this.database.executeSql(`Update TExpensesData set isDelete = ?,Syncdate = ?,Amount =?,Date_unix =?,FamilyKey =?,Title =?,Transaction_type =?,byName =?,date_on=?  where EFCM_ID =?`, DataM)
        console.log('read data from update before add ', JSON.stringify(stored));
      }
      else {
        let DataM = [m.Amount, m.Date_unix, m.EFCM_ID, m.FamilyKey, m.Title, m.Transaction_type, m.byName, m.date_on, m.isDelete, m.Syncdate];
        console.log('add->Expense', DataM);
        const data = await this.database.executeSql('INSERT OR IGNORE INTO TExpensesData (Amount,Date_unix,EFCM_ID,FamilyKey,Title,Transaction_type,byName,date_on,isDelete,Syncdate) VALUES (?,?,?,?,?,?,?,?,?,?)', DataM).then(() => {
          console.log('data added expense');
        })
      }
      //console.log('return obj', data);
    } catch (error) {
      console.log(error);
    }
  }


  async UpdateExpense(m: any) {
    try {
      let syncd = parseInt((new Date().getTime() / 1000).toFixed(0));
      let DataM = [true, syncd, m];
      const data = await this.database.executeSql(`Update TExpensesData set isDelete = ?,Syncdate = ? where EFCM_ID =?`, DataM).then(() => {
      })
    } catch (error) {
      console.log(error);
    }
  }

  async UpdateExpense_edit(m: any) {
    try {

      let DataM = [m.isDelete, m.Syncdate, m.Amount, m.Date_unix, m.FamilyKey, m.Title, m.Transaction_type, m.byName, m.date_on, m.EFCM_ID];
      console.log('edit->Expense  ',JSON.stringify(DataM));

      let stored = await this.database.executeSql(`Update TExpensesData set isDelete = ?,Syncdate = ?,Amount =?,Date_unix =?,FamilyKey =?,Title =?,Transaction_type =?,byName =?,date_on=?  where EFCM_ID =?`, DataM)
      console.log(JSON.stringify('edit review ',stored));
    } catch (error) {
        console.log(error);
    }
  }


}
