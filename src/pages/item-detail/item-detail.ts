import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';

import {Items} from '../../providers/providers';
import {HttpClient, HttpParams} from "@angular/common/http";

import {format} from 'date-fns';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  eventDateStr: string;
  eventTimeStr: string;

  constructor(public navCtrl: NavController,
              navParams: NavParams,
              items: Items,
              private loadingCtrl: LoadingController,
              public http: HttpClient,
              public toastCtrl: ToastController) {
    this.item = navParams.get('item') || items.defaultItem;

    for (let param in this.item) {
      console.log('[Debug] Item property found: ' + param + " = " + this.item[param]);
    }

    // retrieve the user name by the user ID
    if (this.item['ownerId']) {
      const params = new HttpParams()
        .set('id', this.item['ownerId']);

      this.http.get("http://35.185.217.124:8080/user/get", {params}).subscribe(data => {

          this.item['ownerName'] = data['lastName'] + ' ' + data['firstName'];

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

      this.http.get("http://35.185.217.124:8080/file/load", {params}).subscribe(data => {

          console.log('Return Data: ' + data);
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

  joinEvent() {
    this.presentLoading();
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Proceeding...Please wait...",
      duration: 3000
    });
    loader.present();
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

}
