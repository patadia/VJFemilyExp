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

  async GetStorevalue(st:string){
    console.log(st);
    console.log(await this._storage?.get(st));
    return await this._storage?.get(st);
  }

  async SetStorageData(st:string,Data:any){
    let store = await this._storage.set(st,Data);
    return store;
  }

  async ClearStore(){
   await this._storage.clear();
  }

}
