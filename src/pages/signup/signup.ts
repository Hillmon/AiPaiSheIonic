import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {AlertController, IonicPage, LoadingController, NavController, ToastController} from 'ionic-angular';

import { User } from '../../providers/providers';
import { MainPage } from '../pages';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  users: Observable<Object>;
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { firstName: string, lastName: string, email: string, password: string } = {
    firstName: 'Maomao',
    lastName: 'Zheng',
    email: 'mmz@maomao.com',
    password: 'meow'
  };

  // Our translated text strings
  private signupErrorString: string;

  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
              public httpClient: HttpClient,
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController) {

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      this.signupErrorString = value;
    })
  }

  doSignup() {
    // testing with aipaishe cloud VM (OK!)
    console.log("signup first name:"+this.account.firstName);
    console.log("signup last name:"+this.account.lastName);
    console.log("signup email:"+this.account.email);
    console.log("signup pwd:"+this.account);
    let loading = this.loadingCtrl.create();
    loading.present();

    let alert = this.alertCtrl.create({title: 'Signup Failed',
      subTitle: 'Please check and try again',
      buttons: ['Dismiss']});
    this.users = this.httpClient.post('http://35.185.217.124:8080/user/registration', this.account);
    this.users
      .subscribe(data => {
          console.log('Signup result: ', data);

          let notification = this.alertCtrl.create({title: 'Signup Successfully!',
            subTitle: 'Please active the account by confirming the link in your email',
            buttons: [{
              text:'OK',
              handler: ()=>{
                loading.dismissAll();
                this.navCtrl.push(MainPage);
              }
            }
            ]});

          notification.present();
        },
        err =>{ console.warn("Signup error: "+err); loading.dismissAll();alert.present()});
  }
}
