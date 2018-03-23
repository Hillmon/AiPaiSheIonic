import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {AlertController, IonicPage, LoadingController, NavController, ToastController} from 'ionic-angular';

import { User } from '../../providers/providers';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {FirstRunPage} from "../pages";
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  users: Observable<Object>;
  accountValidation: FormGroup;

  ngOnInit(){
    this.accountValidation = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required, this.equalto("password")]),
    })
  };
  // The account fields for the login form.
  // If you're using the username field with or without email, make
  // sure to add it to the type
  account: { firstName: string, lastName: string, email: string, password: string, confirmPassword: string } = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // Our translated text strings
  // private signupErrorString: string;

  constructor(public navCtrl: NavController,
    public user: User,
    public toastCtrl: ToastController,
    public translateService: TranslateService,
              public httpClient: HttpClient,
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController) {

    this.translateService.get('SIGNUP_ERROR').subscribe((value) => {
      // this.signupErrorString = value;
      // console.log(this.signupErrorString);
    })
  }

  doSignup() {
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
            subTitle: 'Please activate the account by confirming the link in your email',
            buttons: [{
              text:'OK',
              handler: ()=>{
                loading.dismissAll();
                this.navCtrl.push(FirstRunPage);
              }
            }
            ]});

          notification.present();
        },
        err =>{ console.warn("Signup error: "+err); loading.dismissAll();alert.present()});
  };

  equalto(field_name): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} => {

      let input = control.value;

      let isValid=control.root.value[field_name]==input;
      if(!isValid)
        return { 'equalTo': {isValid} };
      else
        return null;
    };
  };
}
