// firebase.service.ts
import { getAttrsForDirectiveMatching } from '@angular/compiler/src/render3/view/util';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';
import {StorageService} from '../services/storage.service';
import {AngularFireStorage} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  Membercollection = 'FamilytreeData';
  linkcollection = 'TokenLinker';
  expensetable= "Expensetable";
  Type_Exp_table = "TypeOfExpense";
  Prebal_linker = "PreBalLinker";

  constructor(
    private firestore: AngularFirestore,
    private storage:StorageService,
    private firestorage:AngularFireStorage
  ) { 
    
  }

  veryfin_member_Exist_user(record:any){
    return this.firestore.collection(this.Membercollection,ref=> ref.where('username','==',record.username)).valueChanges();
  }

  veryfin_member_Exist_mobile(record:any){
    return this.firestore.collection(this.Membercollection,ref=> ref.where('Mobile','==',record.Mobile)).valueChanges();
  }

  create_Member(record:any) {
    console.log(record);
    console.log('call create');
    return this.firestore.collection(this.Membercollection).add(record);
  }

  read_Memberss(familykey) {
    return this.firestore.collection(this.Membercollection,ref=> ref.where('FamilyKey','==',familykey).where('isDelete','==',false)).snapshotChanges();
  }

  read_Members_sync(familykey,syncDate) {
    return this.firestore.collection(this.Membercollection,ref=> ref.where('FamilyKey','==',familykey).where('isDelete','==',false).where('Syncdate','>=',syncDate)).valueChanges({idField:'id'});
  }

  varify_Members(record:any) {
    return this.firestore.collection(this.Membercollection,ref=> ref.where('username','==',record.username)
    .where('password','==',record.password).where('Mobile','==',record.Mobile)).snapshotChanges();
  }

  varify_user(record:any) {
    return this.firestore.collection(this.Membercollection,ref=> ref.where('username','==',record.username)
    .where('FamilyKey','==',record.FamilyKey_password)).snapshotChanges();
  }

  varify_user_password(record:any){
    return this.firestore.collection(this.Membercollection,ref=> ref.where('username','==',record.username)
    .where('password','==',record.FamilyKey_password)).snapshotChanges();
  }

  update_Member(recordID, record) {
    this.firestore.doc(this.Membercollection + '/' + recordID).update(record);
  }

 

  update_Expense(record) {
    this.firestore.doc(this.expensetable + '/' + record.id).update(record);
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


  read_expense_Sync(date:number,FamilyKey){
    return this.firestore.collection(this.expensetable,ref=>  ref.where('Syncdate','>=',date)
    .where('FamilyKey','==',FamilyKey).orderBy('Syncdate','desc')).valueChanges({ idField: 'id' });
  }

  Read_expbyMonth(year:number,Month:number,FamilyKey){
    let month = Month ;
    const start = new Date(year,month,1);
    const daysinmonth = new Date(year,month+1,0).getDate();
    //console.log(daysinmonth,month,year);
    const end = new Date(year,month,daysinmonth,23,59,59);
    console.log(start);
    console.log(end);
  //var start_u =  firebase.default.firestore.Timestamp.fromDate(start);
   //var end_u =  firebase.default.firestore.Timestamp.fromDate(end);
     let start_unix =  parseInt((start.getTime() / 1000).toFixed(0));
     let End_unix =  parseInt((end.getTime() / 1000).toFixed(0));
    // console.log(start_unix);
     //console.log(End_unix);
    return this.firestore.collection(this.expensetable, ref => ref
      .where('FamilyKey','==',FamilyKey)
    .where('Date_unix', '>=',  start_unix)
    .where('Date_unix', '<=',  End_unix).orderBy('Date_unix','desc')).snapshotChanges()
    
  }

  VerifyExpdataPrevious(Fkey:string,TType:string){
    return this.firestore.collection(this.expensetable,ref=> ref.where('FamilyKey','==',Fkey).where('Type_expense','==',TType)).valueChanges();
  }


  UploadBlobs(blob,id){
    const uploadTask = this.firestorage.upload(
      `files/${id}/${new Date().getTime()}.png`,
      blob
    );
    
    uploadTask.percentageChanges().subscribe(c=>{
      console.log(c);
    })

  }

  GetImages(id){
    const imageback = this.firestorage.ref(`files/${id}/`);
    console.log(imageback);
    return imageback;
  }

  deleteattachement(id,fname){
    const delfile = this.firestorage.ref(`files/${id}/${fname}`);
    let delsub = delfile.delete().subscribe((data)=>{
      console.log('delete image',data);
       delsub.unsubscribe();
    });
  }

  
  GetTypes_Exp(Syncdate){
   return this.firestore.collection(this.Type_Exp_table,ref => ref.where('Syncdate','>=',Syncdate)).valueChanges();
  }


  setFlagPrebal(data:any){
    return this.firestore.collection(this.Prebal_linker).add(data);
  }

  UpdateFlagPrebal(data:any,Id:string){
    return this.firestore.doc(this.Prebal_linker+'/'+Id).update(data);
  }

  GetPrebalFlag(Fkey:string,Uid:string){
    return this.firestore.collection(this.Prebal_linker,ref=> ref.where('FamilyKey','==',Fkey)
    .where('UserId','==',Uid)).valueChanges({ idField: 'id' });
  }

  GetReadonlyBalflag(Fkey:string){
    return this.firestore.collection(this.Prebal_linker,ref=> 
        ref.where("FamilyKey","==",Fkey)).valueChanges({idField:'id'});
  }



}
