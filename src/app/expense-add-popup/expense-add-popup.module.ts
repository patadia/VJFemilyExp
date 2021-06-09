import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpenseAddPopupPageRoutingModule } from './expense-add-popup-routing.module';

import { ExpenseAddPopupPage } from './expense-add-popup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpenseAddPopupPageRoutingModule
  ],
  declarations: [ExpenseAddPopupPage]
})
export class ExpenseAddPopupPageModule {}
