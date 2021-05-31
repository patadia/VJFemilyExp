import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SplitMasterPageRoutingModule } from './split-master-routing.module';
import { SplitMasterPage } from './split-master.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SplitMasterPageRoutingModule
  ],
  declarations: [SplitMasterPage]
})
export class SplitMasterPageModule {}
