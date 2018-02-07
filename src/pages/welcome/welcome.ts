import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { MainPage } from '../pages';
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
// testing HTTP onlyn
  users: Observable<any>;
  email=null;
  password=null;

  constructor(public navCtrl: NavController, public httpClient: HttpClient) { }

  login() {
    //TODO: need to re-use the existing login RESTful API
    // this.navCtrl.push('LoginPage');

    // testing with aipaishe cloud VM (OK!)

    const loginBody = {email: this.email, password:this.password};

    console.log("login email:"+this.email);
    console.log("login pwd:"+this.password);
    this.users = this.httpClient.post('http://35.185.217.124:8080/user/login', loginBody);
    this.users
      .subscribe(data => {
        console.log('login result: ', data);
      });

    this.navCtrl.push(MainPage);
  }

  signup() {
    //TODO: need to re-use the existing signup RESTful API
    this.navCtrl.push('SignupPage');
  }
}
