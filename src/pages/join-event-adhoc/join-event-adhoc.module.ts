import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {IonicPageModule} from 'ionic-angular';

import {JoinEventAdhocPage} from './join-event-adhoc';

@NgModule({
  declarations: [
    JoinEventAdhocPage,
  ],
  imports: [
    IonicPageModule.forChild(JoinEventAdhocPage),
    TranslateModule.forChild()
  ],
  exports: [
    JoinEventAdhocPage
  ]
})
export class JoinEventAdhocPageModule {
}
