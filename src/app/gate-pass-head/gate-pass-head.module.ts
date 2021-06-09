import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GatePassHeadPageRoutingModule } from './gate-pass-head-routing.module';

import { GatePassHeadPage } from './gate-pass-head.page';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    BsDropdownModule,
    GatePassHeadPageRoutingModule
  ],
  declarations: [GatePassHeadPage]
})
export class GatePassHeadPageModule {}
