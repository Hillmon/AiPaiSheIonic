import {Component} from '@angular/core';
import {AlertController, IonicPage, LoadingController, NavController} from 'ionic-angular';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {MainPage} from '../pages';
import {User} from '../../providers/providers';
import {Api} from "../../providers/api/api";

declare var window;

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

  constructor(public navCtrl: NavController,
              public httpClient: HttpClient,
              public loadingCtrl: LoadingController,
              public alertCtrl: AlertController,
              public user: User,
              public api: Api) {
  }

  login() {
    console.log("login email:" + this.email);
    console.log("login pwd:" + this.password);

    if (this.email == null || this.password == null) {
      let alert = this.alertCtrl.create({
        title: 'Oops',
        subTitle: 'Email or password cannot be empty!',
        buttons: ['Dismiss']
      });

      alert.present();
      return;
    }

    let loader = this.loadingCtrl.create({
      content: 'Logging in...please wait...',
      duration: 3000
    });
    loader.present();

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

    const params = new HttpParams()
      .set('email', this.email)
      .set('password', this.password);

    this.httpClient.get(this.api.url + '/user/login', {params}).subscribe(data => {
        console.log('Login API returns: ', data);

          // set the login user profile with the user service
          // let userProfile = data;
          this.user.setLoginUser(data);

        loader.dismissAll();
          this.navCtrl.push(MainPage);
        },
        err => {
          // let errJson = JSON.parse(err.error);
          // console.warn(errJson);
          console.error('Log in error!!!');
          console.error(err);
          loader.dismissAll();

          let alert = this.alertCtrl.create({
            title: 'Oops',
            subTitle: err['error']['message'],
            buttons: ['Dismiss']
          });

          alert.present();

          this.password = '';
        });
  }

  signUp() {
    // direct to the page for signup
    this.navCtrl.push('SignupPage');
  }

  welcomeGuest() {
    // direct to the list master page
    this.navCtrl.push('ListMasterPage');
  }

  loginWeChat() {
       // Testing code for WeChat Login
       var scope = "snsapi_userinfo",
         state = "_" + (+new Date());
       window.Wechat.auth(scope, state, function (response) {
         // you may use response.code to get the access token.
         alert(JSON.stringify(response));
       }, function (reason) {
         alert("Failed: " + reason);
       });
  }
}
