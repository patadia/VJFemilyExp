// firebase.service.ts
import { getAttrsForDirectiveMatching } from '@angular/compiler/src/render3/view/util';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
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

  read_Memberss(familykey) {
    return this.firestore.collection(this.Membercollection,ref=> ref.where('FamilyKey','==',familykey)).snapshotChanges();
  }

  varify_Members(record:any) {
    return this.firestore.collection(this.Membercollection,ref=> ref.where('username','==',record.username)
    .where('password','==',record.password)).valueChanges();
  }

  varify_user(record:any) {
    return this.firestore.collection(this.Membercollection,ref=> ref.where('username','==',record.username)
    .where('FamilyKey','==',record.FamilyKey)).snapshotChanges();
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
  // var start_u =  firebase.default.firestore.Timestamp.fromDate(start);
  // var end_u =  firebase.default.firestore.Timestamp.fromDate(end);
     let start_unix =  parseInt((start.getTime() / 1000).toFixed(0));
     let End_unix =  parseInt((end.getTime() / 1000).toFixed(0));
     console.log(start_unix);
     console.log(End_unix);
    return this.firestore.collection(this.expensetable, ref => ref
    .where('Date_unix', '>=',  start_unix)
    .where('Date_unix', '<=',  End_unix)).valueChanges()
    
  }

  



}
