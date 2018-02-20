import {Component} from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController} from 'ionic-angular';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {MainPage} from '../pages';

/**
 * The Welcome Page is a splash page that quickly describes the app,
 * and then directs the user to create an account or log in.
 * If you'd like to immediately put the user onto a login/signup page,
 * we recommend not using the Welcome page.
 */
@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html'
})
export class WelcomePage {
  users: Observable<any>;
  email = null;
  password = null;

  constructor(public navCtrl: NavController, public httpClient: HttpClient, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
  }

  login() {
    console.log("login email:" + this.email);
    console.log("login pwd:" + this.password);
    let loading = this.loadingCtrl.create();
    loading.present();

    /**
     * edited by Hillmon on 20/02/2018, replaced by a common alert function
     */
    /*
      let alert = this.alertCtrl.create({
      title: 'Login Failed',
      subTitle: 'Please check and try again',
      buttons: ['Dismiss']
    });
    */
    this.users = this.httpClient.get('http://35.185.217.124:8080/user/login?email=' + this.email + '&password=' + this.password);
    this.users
      .subscribe(data => {
          console.log('login result: ', data);
          loading.dismissAll();
          this.navCtrl.push(MainPage);
        },
        err => {
          let errJson = JSON.parse(err.error);
          console.warn(errJson);
          loading.dismissAll();

          let alert = this.alertCtrl.create({
            title: 'Login Failed',
            subTitle: errJson['message'],
            buttons: ['Dismiss']
          });

          alert.present();

          this.password = '';
        });
  }

  signup() {
    // direct to the page for signup
    this.navCtrl.push('SignupPage');
  }
}
