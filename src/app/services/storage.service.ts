import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage'

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    console.log('storage Initialize')
    console.log(this._storage);
  }

  async GetStorevalue(st: string) {
    console.log(st);
    console.log(await this._storage?.get(st));
    return await this._storage?.get(st);
  }

  async SetStorageData(st: string, Data: any) {
    let store = await this._storage.set(st, Data);
    return store;
  }

  async ClearStore() {
    var fcmid = await this._storage.get('fcmID');
    var syncdate_mem = await this._storage.get('SyncDate_v1-Member-'+fcmid);
    var syncdate_exp = await this._storage.get('SyncDate_v1-Expense-'+fcmid);
    var syncdate_type_exp = await this._storage.get('SyncDate_v1-typeExpense-'+fcmid);

    await this._storage.clear();

    var syncsetup = await this._storage.set('SyncDate_v1-Member-'+fcmid,syncdate_mem);
    var syncsetup_e = await this._storage.set('SyncDate_v1-Expense-'+fcmid,syncdate_exp);
    var syncsetup_trxp = await this._storage.set('SyncDate_v1-typeExpense-'+fcmid,syncdate_type_exp);
  }

  async SetSyncDate(date: any,type:any) {
    var syncdate = new Date(date);
    var unixsync = parseInt((syncdate.getTime() / 1000).toFixed(0));
    var fcmid = await this._storage.get('fcmID');
    console.log('set sync' + fcmid + '--> ',syncdate);

    let storedate = await this._storage.set('SyncDate_v1-'+type+'-'+fcmid, unixsync);
    return storedate;
  }

  async GetSyncDate(type:any) {
    var fcmid = await this._storage.get('fcmID');
    let storedate = await this._storage?.get('SyncDate_v1-'+type+'-'+fcmid);
    console.log('get-'+fcmid,storedate);
    if (!storedate) {
      var syncdate = new Date(1990, 1, 1);
      console.log('getafter new setup',syncdate);
      var unixsync = parseInt((syncdate.getTime() / 1000).toFixed(0));
      return await this._storage.set('SyncDate_v1-'+type+'-'+fcmid, unixsync);
    }
    else
      return storedate;
  }

}
