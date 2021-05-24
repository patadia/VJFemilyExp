import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FamilytreePage } from './familytree.page';

const routes: Routes = [
  {
    path: '',
    component: FamilytreePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FamilytreePageRoutingModule {}
