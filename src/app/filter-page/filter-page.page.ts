import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {DataService} from '../services/data.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-filter-page',
  templateUrl: './filter-page.page.html',
  styleUrls: ['./filter-page.page.scss'],
})
export class FilterPagePage implements OnInit {
  Formfilter:FormGroup;
  startdate:any;
  enddate:any;
  names:any[] = [];
  Familykey: any;

  constructor(private popover: PopoverController,
    private fb:FormBuilder,
    private navParams: NavParams,
    public datepipe: DatePipe,
    public db:DataService,
    public Store: StorageService,) { 
      this.Store.init().then(() => {

        this.init();
      })
      let startdateObj =new Date( new Date().getFullYear(),new Date().getMonth(),1);
      this.startdate = this.datepipe.transform(startdateObj, 'yyyy-MM-dd');
      let lastdate = new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
      let lastdateobj = new Date(new Date().getFullYear(),new Date().getMonth(),lastdate);
      console.log(lastdate,lastdateobj);
      this.enddate = this.datepipe.transform(lastdateobj, 'yyyy-MM-dd');
     
  }
  async init() {
    this.Familykey = await this.Store.GetStorevalue('familykeyID');
    console.log(this.Familykey);
    this.LoadNames();
  }
  async LoadNames(){
    this.db.Fetchnames(this.Familykey).subscribe((s)=>{
      console.log(JSON.stringify(s));
      this.names = s.map(e=>{
        return e.byName
      });
    });
  }
  ngOnInit() {
    this.Formfilter = this.fb.group({
      Sdate: new FormControl(this.startdate),
      Edate: new FormControl(this.enddate),
      Bynameselect : new FormControl('default'),
    },{validator: this.dateLessThan('Sdate', 'Edate')})
  }

  dateLessThan(from: string, to: string) {
    return (group: FormGroup): {[key: string]: any} => {
      let f = group.controls[from];
      let t = group.controls[to];
      if (f.value > t.value) {
        return {
          dates: "Start Date should be less than End Date"
        };
      }  
      return {};
    }
  }

  FilterRecord(){
    console.log(this.Formfilter.value)
    try {
     let data = this.Formfilter.value;
      this.popover.dismiss({
        "Filterdata": data
      })
    } catch (error) {
      console.log(error);
    }
  }

}
