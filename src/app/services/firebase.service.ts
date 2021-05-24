// firebase.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  Membercollection = 'FamilytreeData';
  linkcollection = 'TokenLinker';
  expensetable= "Expensetable"

  constructor(
    private firestore: AngularFirestore
  ) { }

  create_Member(record) {
    console.log(record);
    console.log('call create');
    return this.firestore.collection(this.Membercollection).add(record);
  }

  read_Memberss() {
    return this.firestore.collection(this.Membercollection).snapshotChanges();
  }

  update_Member(recordID, record) {
    this.firestore.doc(this.Membercollection + '/' + recordID).update(record);
  }

  delete_Member(record_id) {
    this.firestore.doc(this.Membercollection + '/' + record_id).delete();
  }

  create_Linkmember(token:string,id:string){
    let linkmember = {
      Id :id,
      FamilyToken : token
    }
    this.firestore.collection(this.linkcollection).add(linkmember);
  }

  Create_expense(expense){
    return this.firestore.collection(this.expensetable).add(expense);
  }

  read_expense(){
    return this.firestore.collection(this.expensetable).snapshotChanges();
  }

  Read_expbyMonth(year:number,Month:number){
    const start = new Date(year,Month,1);
    const daysinmonth = new Date(year,Month,0).getDate();
    const end = new Date(year,Month,daysinmonth);
    console.log(start);
    console.log(end);
   ;
    // let start_unix =  parseInt((start.getTime() / 1000).toFixed(0));
    return this.firestore.collection(this.expensetable, ref => ref
    .where('Date_unix', '>',  parseInt((start.getTime() / 1000).toFixed(0)))
    .where('Date_unix', '<',  parseInt((end.getTime() / 1000).toFixed(0)))).snapshotChanges();
  }



}
