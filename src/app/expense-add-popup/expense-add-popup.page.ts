import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NavParams, PopoverController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FirebaseService } from '../services/firebase.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { DataService,TType_Exp } from '../services/data.service';

interface TPhotoes {
  image: SafeResourceUrl,
  filename: string,
  id:number,
  type:string
}

@Component({
  selector: 'app-expense-add-popup',
  templateUrl: './expense-add-popup.page.html',
  styleUrls: ['./expense-add-popup.page.scss'],
})
export class ExpenseAddPopupPage implements OnInit {

  slideOpts = {
    slidesPerView: 2,
    spaceBetween: 0 
  };
  public title: string = '';
  public amount: any;
  public type: any;
  public byName: string = '';
  public mySelect: any;
  private Fkey: string;
  public AddBtn: boolean = true;
  public dateonadd: any;
  public imagecount: number;
  public typeselect:any
  public type_exp:any;
  Photoes:TPhotoes[] = [];
  delPhotoes:TPhotoes[] = [];
  counter: number = 0;
  typesofExp = [];
  public Syncdate:number;
  
  constructor(private popover: PopoverController,
    private navParams: NavParams,
    private Store: StorageService,
    public datepipe: DatePipe,
    private sanitizer: DomSanitizer,
    private fire:FirebaseService,
    private phview:PhotoViewer,
    private db:DataService
   ) {
    this.dateonadd = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
    this.Store.init().then(() => {

      this.init();
      //  this.AddBtn = true;
    })

  }
  
  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);

    this.byName = await this.Store.GetStorevalue('name_user');
    this.Fkey = await this.Store.GetStorevalue('familykeyID');
    this.Syncdate = Number(await this.Store.GetSyncDate('typeExpense'));
    this.gettypes_Expenses();
    this.type_exp = 'default'

  }
  async gettypes_Expenses(){
   let firete =   this.fire.GetTypes_Exp(this.Syncdate).subscribe((edata:any)=>{
     
      edata.forEach(e=>{
        let typeexp:TType_Exp = {
           Type : e.Type,
          Syncdate:e.Syncdate
        }

        this.db.AddType_Expenses(typeexp).then(() => {
          console.log('TypesExp added ', JSON.stringify(typeexp))
        })
      });
      this.Store.SetSyncDate(new Date(), 'typeExpense');
      this.getDBTypeExp();
      firete.unsubscribe();
   })
    // this.typeselect = this.navParams.data.ExpenseData?.Type_expense;
    //   this.type_exp = this.navParams.data.ExpenseData?.Type_expense;
  }


  getDBTypeExp(){
    console.log('call types started');
    try {
      this.db.FetchTypesOfexpense().subscribe((s)=>{
        console.log('types of data exp',JSON.stringify(s));
        s.forEach(t=>{
          this.typesofExp.push(t.Type);
        })

        this.typeselect = this.navParams.data.ExpenseData?.Type_expense;
      this.type_exp = this.navParams.data.ExpenseData?.Type_expense;
      })
    } catch (error) {
      console.log(error);
    }
  }
  
  ngOnInit() {
    console.log(this.navParams.data.ExpenseData);
    if (this.navParams.data?.ExpenseData) {
      console.log('navparam', JSON.stringify(this.navParams));
      this.AddBtn = false;
      this.title = this.navParams.data.ExpenseData.Title;
      this.amount = this.navParams.data.ExpenseData.Amount;
      this.type = this.navParams.data.ExpenseData.Transaction_Type;
      this.mySelect = this.navParams.data.ExpenseData.Transaction_Type;
      this.dateonadd = this.datepipe.transform(this.navParams.data.ExpenseData.date_on, 'yyyy-MM-dd');
      this.byName = this.navParams.data.ExpenseData.byName;
      this.imagecount = this.navParams.data.ExpenseData.Images;
      if(this.imagecount > 0){
        this.getImages(this.navParams.data.ExpenseData.id);
      }
      
    }
  }

  getImages(id){
    try {
      let sc = this.fire.GetImages(id);
        console.log(sc);
        sc.listAll().forEach(async (res)=>{
          res.items.forEach(async(ref) =>{
              let urlget = await ref.getDownloadURL();
              let attachment = {
                image: this.sanitizer.bypassSecurityTrustResourceUrl(urlget),
                filename: ref.name,
                id:this.counter,
                type:'frombase'

              };
              this.Photoes.push(attachment);
              this.counter = this.counter + 1;
          })
        })
    } catch (error) {
      console.log(error);
    }
  }

  Add_data() {

    const data = {
      Title: this.title.trim(),
      Amount: Number(this.amount),
      Transaction_Type: this.type,
      date_on: new Date(this.datetoDatetime(this.dateonadd)).toString(),
      Date_unix: parseInt((new Date(this.datetoDatetime(this.dateonadd)).getTime() / 1000).toFixed(0)),
      byName: this.byName,
      FamilyKey: this.Fkey,
      Syncdate: parseInt((new Date().getTime() / 1000).toFixed(0)),
      isDelete: false,
      Images: this.Photoes.length,
      Type_expense:this.type_exp
    }

    const images = {
      photoes : this.Photoes
    }
    //console.log(data);
    if (!data.Title || !data.Amount || !data.Transaction_Type) {
      alert('Add All the Field');
      return;
    }
    this.popover.dismiss({
      "Add_data": {data,images}
    })
  }

  verifyModel(dta: any) {

  }

  datetoDatetime(date:any){
    let dateobj = new Date(date);
    let current_date = new Date();
    let datenew =  new Date(dateobj.getFullYear(),dateobj.getMonth(),dateobj.getDate(),current_date.getHours(),current_date.getMinutes())
    console.log(datenew);
    return datenew;
  }

  onChange(mySelect) {
    this.type = mySelect.detail.value;
    //console.log(mySelect.detail.value);
  }

  onChangetype(s){
   this.type_exp= s.detail.value
  }




  Edit_data() {
    try {
      console.log('in edit');
      const data = {
        Title: this.title.trim(),
        Amount: Number(this.amount),
        Transaction_Type: this.type,
        date_on: new Date(this.datetoDatetime(this.dateonadd)).toISOString(),
        Date_unix: parseInt((new Date(this.datetoDatetime(this.dateonadd)).getTime() / 1000).toFixed(0)),
        byName: this.navParams.data.ExpenseData.byName,
        FamilyKey: this.Fkey,
        Syncdate: parseInt((new Date().getTime() / 1000).toFixed(0)),
        isDelete: false,
        id: this.navParams.data.ExpenseData.id,
        Images:this.Photoes.length,
        Type_expense:this.type_exp
      }

      const images = {
        photoes : this.Photoes,
        delphotoes: this.delPhotoes
      }

      console.log('edit data', JSON.stringify(data));
      if (!data.Title || !data.Amount || !data.Transaction_Type) {
        alert('Add All the Field');
        return;
      }
      this.popover.dismiss({
        "Edit_data": {data,images}
      })
    } catch (error) {
      console.log('edit error', error);
    }
  }

 
  async UploadAttachment() {
  

    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt
    });

    let attachment = {
      image: this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl)),
      filename: image.format,
      id:this.counter,
      type:'dataurl'
    };
    this.counter = this.counter+1;
    console.log(attachment);
    this.Photoes.push(attachment as TPhotoes);
  }

  async Deleteimage(id:any){
console.log(id);
    let delp = this.Photoes.filter(e=> e.id === id);
    this.delPhotoes.push(delp[0]);
    this.Photoes = this.Photoes.filter(e => e.id !== id);
  }

  async Downloadimage(img:any){
    try {
      // console.log('image----> --> ',JSON.stringify(img));
      // var xhr = new XMLHttpRequest();
      // xhr.responseType = 'blob';
      // xhr.onload = (event) => {
      //   var blob = xhr.response;
      // };
      // xhr.open('GET', img.changingThisBreaksApplicationSecurity);
      // xhr.send();
      window.open(img.changingThisBreaksApplicationSecurity);
     
    } catch (error) {
      console.log(error);
    }
  }

  async fullimage(img){
    try {
      this.phview.show(img.changingThisBreaksApplicationSecurity,'',{share: true});
    } catch (error) {
      console.log(error);
    }
  }
  
  popupclose(){
    this.popover.dismiss();
  }
}
