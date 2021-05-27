import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GatePassHeadPage } from './gate-pass-head.page';

const routes: Routes = [
  {
    path: '',
    component: GatePassHeadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GatePassHeadPageRoutingModule {}
