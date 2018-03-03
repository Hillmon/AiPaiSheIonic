import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LoadingController } from 'ionic-angular';

import { Items } from '../../providers/providers';
import {HttpClient, HttpParams} from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;

  constructor(public navCtrl: NavController,
              navParams: NavParams,
              items: Items,
              private loadingCtrl: LoadingController,
              public http: HttpClient) {
    this.item = navParams.get('item') || items.defaultItem;

    // retrieve the user name by the user ID
    const params = new HttpParams()
      .set('id', this.item['owner']);

    this.http.get("http://35.185.217.124:8080/user/get", {params}).subscribe(data => {

        this.item['ownername'] = data['lastName'] + ' ' + data['firstName'];

      },
      err => {
        console.warn("Retrieve user profile error: " + err);
      });

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

}
