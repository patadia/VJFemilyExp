import { Injectable } from '@angular/core';
import XLSX from 'xlsx'
import { Papa } from 'ngx-papaparse';
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  csvData: any[] = [];
  HeaderRow: any[] = [];
  constructor(private papa: Papa,
    private file: File, private sshare: SocialSharing,
    ) { }


  async exportToExcel(data, filename) {
    {
        // console.log(JSON.stringify(data));
      // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
      // const wb: XLSX.WorkBook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(wb, ws, filename);
      // XLSX.writeFile(wb, filename + '.xlsx');
      let dataArr =this.ConvertToCSV(data,["id","Title","Amount","Transaction_Type","date_on","byName","isDelete","Type_expense"]);
      this.papa.parse(dataArr, {
        complete: (result) => {
         // console.log('TO parser ------------>>> ',JSON.stringify(result))
          this.HeaderRow = result.data.splice(0, 1)[0];
          this.csvData = result.data;
          //console.log(JSON.stringify(this.HeaderRow))
          //console.log(JSON.stringify(this.csvData))
          this.Unparse();
        }
      });
    }
  }

  Unparse() {
    console.log(`to unparse-------------->>>`);
    let csv = this.papa.unparse({
      fields: this.HeaderRow,
      data: this.csvData
    });

    let filename  = `export${new Date().getTime()}.csv`

    this.file.writeFile(this.file.externalRootDirectory+'/Download/',filename,csv,{replace:true}).then(res=>{
     // console.log(JSON.stringify(res));
     // this.sshare.share(null,null,res.nativeURL,null);
     alert(`File ' ${filename} ' Saved in Download folder `);
    })
    // this.file.writeFile(this.file.externalRootDirectory+'/Download/','exp2.csv',csv,{replace:true}).then((res)=>{
    //   console.log('file saved---->',res.nativeURL);
    // })
  }



  ConvertToCSV(objArray, headerList) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';
    for (let index in headerList) {
     row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
     let line = (i+1)+'';
     for (let index in headerList) {
      let head = headerList[index];
      line += ',' + array[i][head];
     }
     str += line + '\r\n';
    }
    return str;
   }



}
