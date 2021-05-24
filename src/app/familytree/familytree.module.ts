import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FamilytreePageRoutingModule } from './familytree-routing.module';

import { FamilytreePage } from './familytree.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FamilytreePageRoutingModule
  ],
  declarations: [FamilytreePage]
})
export class FamilytreePageModule {}
