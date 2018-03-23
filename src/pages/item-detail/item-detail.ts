import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';

import {Items} from '../../providers/providers';
import {HttpClient, HttpParams} from "@angular/common/http";

import {format} from 'date-fns';
import {User} from "../../providers/user/user";

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  eventDateStr: string;
  eventTimeStr: string;
  loader: any;
  alreadyJoin: boolean;
  btnText: string;
  endpoint: string = "http://35.185.217.124:8080";

  // endpoint: string = "http://localhost:8080";

  constructor(public navCtrl: NavController,
              navParams: NavParams,
              items: Items,
              private loadingCtrl: LoadingController,
              public http: HttpClient,
              public toastCtrl: ToastController,
              public user: User) {
    this.item = navParams.get('item') || items.defaultItem;

    for (let param in this.item) {
      console.log('[Debug] Item property found: ' + param + " = " + this.item[param]);
    }

    // retrieve the user name by the user ID
    if (this.item['ownerId']) {
      const params = new HttpParams()
        .set('id', this.item['ownerId']);

      this.http.get(this.endpoint + "/user/get", {params}).subscribe(data => {

          if (data)

          this.item['ownerName'] = data['lastName'] + ' ' + data['firstName'];

          else

            this.item['ownerName'] = 'Unknown User';

        },
        err => {
          this.presentToast('Retrieve user profile error!');
          console.error(err);
        });
    }
    else {
      this.presentToast('System error: event owner not found!');
    }

    // retrieve the event profile pic by the event ID
    if (this.item['eventId']) {
      const params = new HttpParams()
        .set('eventId', this.item['eventId'])
        .set('fileType', 'poster');

      this.http.get(this.endpoint + "/file/load", {params}).subscribe(data => {

          console.log('Return Data: ');
          console.log(data);
          if (data[0]) {
            this.item['profilePic'] = data[0]['location'];
          }
        },
        err => {
          this.presentToast("Retrieve poster image error!");
          console.warn(err);
        });
    }
    else {
      this.presentToast('System error: event ID not found!');
    }

    var date = new Date(this.item['eventDate']);
    this.eventDateStr = format(date, 'DD/MM/YYYY');
    this.eventTimeStr = format(date, 'HH:MM');
  }

  ionViewDidLoad() {
    // Put here the code you want to execute
    this.checkEvent();
  }

  joinEvent() {

    this.presentLoading("Joining the event for you...");

    // retrieve the login user profile with the user service
    let userProfile = this.user.getLoginUser();

    // retrieve the event profile pic by the event ID
    if (this.item['eventId'] && userProfile['id']) {
      const params = new HttpParams()
        .set('eventId', this.item['eventId'])
        .set('userId', userProfile['id']);

      this.http.get(this.endpoint + "/eulink/create", {params}).subscribe(data => {

          console.log('Return Data: ');
          console.log(data);

          this.presentToast("You have joined this event successfully!");
          this.alreadyJoin = true;
          this.btnText = 'You are already in!';

        },
        err => {
          this.presentToast("Create event-user link error!");
          console.error(err);
        });
    }
    else {
      this.presentToast('Event ID or User ID not found!');
    }
  }

  presentLoading(msg) {
    this.loader = this.loadingCtrl.create({
      content: msg,
      duration: 3000
    });
    this.loader.present();
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  checkEvent(): any {
    this.presentLoading("Checking the event status...");

    // retrieve the login user profile with the user service
    let userProfile = this.user.getLoginUser();

    console.log("Current event ID:" + this.item['eventId']);

    console.log("Current login user profile:");
    console.log(userProfile);

    // retrieve the event profile pic by the event ID
    if (this.item['eventId'] && userProfile['id']) {
      console.log("Ready to check the status...");

      const params = new HttpParams()
        .set('eventId', this.item['eventId'])
        .set('userId', userProfile['id']);

      this.http.get(this.endpoint + "/eulink/check", {params}).subscribe(data => {

          this.loader.dismissAll();

          if (data) {
            this.alreadyJoin = true;
            this.btnText = 'You are already in!';
          }
          else {
            this.alreadyJoin = false;
            this.btnText = 'Join this event!';
          }
        },
        err => {
          this.presentToast("Checking event-user link error!");
          console.error(err);
        });
    }
    else {
      this.presentToast('Event ID or User ID not found!');
    }
  }

}
