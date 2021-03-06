import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'familytree',
    loadChildren: () => import('./familytree/familytree.module').then( m => m.FamilytreePageModule)
  },
  {
    path: 'expenses',
    loadChildren: () => import('./expenses/expenses.module').then( m => m.ExpensesPageModule)
  },
  {
    path: 'gate-pass-head',
    loadChildren: () => import('./gate-pass-head/gate-pass-head.module').then( m => m.GatePassHeadPageModule)
  },
  {
    path: 'split-master',
    loadChildren: () => import('./split-master/split-master.module').then( m => m.SplitMasterPageModule)
  },
  {
    path: 'expense-add-popup',
    loadChildren: () => import('./expense-add-popup/expense-add-popup.module').then( m => m.ExpenseAddPopupPageModule)
  },
  {
    path: 'filter-page',
    loadChildren: () => import('./filter-page/filter-page.module').then( m => m.FilterPagePageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then( m => m.SettingPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
