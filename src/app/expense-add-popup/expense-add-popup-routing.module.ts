import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpenseAddPopupPage } from './expense-add-popup.page';

const routes: Routes = [
  {
    path: '',
    component: ExpenseAddPopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseAddPopupPageRoutingModule {}
