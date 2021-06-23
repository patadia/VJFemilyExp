import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilterPagePage } from './filter-page.page';

const routes: Routes = [
  {
    path: '',
    component: FilterPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilterPagePageRoutingModule {}
