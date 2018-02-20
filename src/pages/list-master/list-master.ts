import { Component } from '@angular/core';
import {AlertController, IonicPage, ModalController, NavController} from 'ionic-angular';

import { Item } from '../../models/item';
import { Items } from '../../providers/providers';
import {Api} from "../../providers/api/api";
import {HttpClient, HttpParams} from "@angular/common/http";

@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})
export class ListMasterPage {
  currentItems: Item[];

  constructor(public navCtrl: NavController, public items: Items, public modalCtrl: ModalController, public alertCtrl: AlertController, public api: Api, public http: HttpClient) {
    this.currentItems = this.items.query();
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
  }

  /**
   * Prompt the user to add a new item. This shows our ItemCreatePage in a
   * modal and then adds the new item to our data source if the user created one.
   */
  addItem() {
    let addModal = this.modalCtrl.create('ItemCreatePage');
    addModal.onDidDismiss(item => {
      if (item) {
        // this.items.add(item);

        for (let param in item){
          console.log('[Debug] Parameter Found: ' + param + " = " + item[param]);
        }

        const params = new HttpParams()
          .set('owner', item['owner'])
          .set('name', item['name'])
          .set('venue', item['venue'])
          .set('date', item['date'])
          .set('desc', item['desc']);

        this.http.get("http://35.185.217.124:8080/createevent", {params}).subscribe(data => {
            console.log('Create event result: ', data);
            this.showAlert('Your new event has been created! Please share it to invite people to join!');
          },
          err =>{
            console.warn("Create event error: " + err);
            this.showAlert('Event cannot be created! Please contact Aipaishe development team!');
          });

        /*
        this.api.get('createevent', item).subscribe(data => {
            console.log('Create event result: ', data);
            this.showAlert('Your new event has been created! Please share it to invite people to join!');
            //this.navCtrl.push(MainPage);
          },
          err =>{
          console.warn("Create event error: " + err);
          this.showAlert('New event cannot be created! Please contact Aipaishe development team!');
        });
        */
      }
    })
    addModal.present();
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    this.items.delete(item);
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }

  showAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Hello World',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }
}
