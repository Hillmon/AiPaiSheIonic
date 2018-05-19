import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {IonicPageModule} from 'ionic-angular';

import {JoinEventRegisteredUserPage} from './join-event-registered';

@NgModule({
  declarations: [
    JoinEventRegisteredUserPage,
  ],
  imports: [
    IonicPageModule.forChild(JoinEventRegisteredUserPage),
    TranslateModule.forChild()
  ],
  exports: [
    JoinEventRegisteredUserPage
  ]
})
export class JoinEventAdhocPageModule {
}
