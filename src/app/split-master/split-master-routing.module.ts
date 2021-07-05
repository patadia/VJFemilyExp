import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SplitMasterPage } from './split-master.page';

const routes: Routes = [{
path: '',
redirectTo:'expenses',
pathMatch: 'full'
},
  {
    path: '',
    component: SplitMasterPage,
    children:[
      {
        path: 'familytree',
        loadChildren: () => import('../familytree/familytree.module').then( m => m.FamilytreePageModule)
      },
      {
        path: 'expenses',
        loadChildren: () => import('../expenses/expenses.module').then( m => m.ExpensesPageModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('../setting/setting.module').then( m => m.SettingPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SplitMasterPageRoutingModule {}
