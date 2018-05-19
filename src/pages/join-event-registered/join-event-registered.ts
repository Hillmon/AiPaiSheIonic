import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IonicPage, NavController, ViewController} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-join-event-adhoc',
  templateUrl: 'join-event-registered.html'
})
export class JoinEventRegisteredUserPage {
  @ViewChild('fileInput') fileInput;

  item: any;

  form: FormGroup;

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              formBuilder: FormBuilder) {

    this.form = formBuilder.group({
      remarks: ['', Validators.maxLength(256)]
    });

  }

  ionViewDidLoad() {

  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  confirm() {
    if (!this.form.valid) {
      return;
    }
    this.viewCtrl.dismiss(this.form.value);
  }
}
