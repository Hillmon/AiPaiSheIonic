import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LoadingController } from 'ionic-angular';

import { Items } from '../../providers/providers';

@IonicPage()
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  item: any;
  loadingCtrl: any;

  constructor(public navCtrl: NavController, navParams: NavParams, items: Items, loadingCtrl: LoadingController) {
    this.item = navParams.get('item') || items.defaultItem;
    this.loadingCtrl = loadingCtrl;
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
