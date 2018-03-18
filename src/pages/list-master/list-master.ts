import {Component} from '@angular/core';
import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  ToastController
} from 'ionic-angular';

import {Item} from '../../models/item';
import {Items} from '../../providers/providers';
import {Api} from "../../providers/api/api";
import {HttpClient, HttpParams} from "@angular/common/http";

declare var window;

@IonicPage()
@Component({
  selector: 'page-list-master',
  templateUrl: 'list-master.html'
})

export class ListMasterPage {

  currentItems: Item[];

  constructor(public navCtrl: NavController,
              public items: Items,
              public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public api: Api,
              public http: HttpClient,
              public loadingCtrl: LoadingController,
              public toastCtrl: ToastController) {
  }

  /**
   * The view loaded, let's query our items for the list
   */
  ionViewDidLoad() {
  }

  ionViewWillEnter(){
    this.currentItems=this.items.query();
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

        let loader = this.loadingCtrl.create({
          content: "Creating the event...please wait..."
        });
        loader.present();

        for (let param in item) {
          console.log('[Debug] Parameter Found: ' + param + " = " + item[param]);
        }

        const params = new HttpParams()
          .set('owner', item['ownerId'])
          .set('date', item['eventDate'] + ' ' + item['eventTime'])
          .set('name', item['eventName'])
          .set('venue', item['eventVenue'])
          .set('type', item['eventType'])
          .set('quota', item['eventQuota']);

        // create a new event via REST API
        this.http.get("http://35.185.217.124:8080/event/create", {params}).subscribe(data => {
            console.log('Create event database record result: ', data);

            if (item['profilePic'] == '') {
              // load "default" poster image from GCP Storage if the profile pic does not exist
              item['profilePic'] = 'https://storage.googleapis.com/aipaishe/exercise-fitness.png';
            }
            else {
              // upload the poster to GCP cloud storage, generate the public URL
              console.log("uploading the poster for new event: " + data['eventId']);
              this.uploadFile(item['profilePic'], data['eventId']);
            }

            loader.dismiss();
            this.presentToast('Your new event has been created! Please share it to invite people to join!');

            // open the page for the newly created event
            this.navCtrl.push('ItemDetailPage', {
              item: item
            });
          },
          err => {
            console.warn("Create event error: " + err);
            this.presentToast('Event cannot be created! Please contact Aipaishe development team!');
          });
      }
    });
    addModal.present();
  }

  uploadFile(imgUri: any, eventId: any) {
    let apiUrl = "http://35.185.217.124:8080/upload2cloud";

    const formData = new FormData();

    const imgBlob = this.dataURItoBlob(imgUri, "image/jpeg");

    console.log(imgBlob);

    // generate XHR form data, including upload file binary and request parameters
    formData.append('files', imgBlob, 'ionic-test-upload.jpeg');
    formData.append("event_id", eventId);
    formData.append("file_type", "poster");

    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl, true);

    /*
    xhr.upload.onprogress = (event) => {
      this.progress = Math.round(event.loaded / event.total * 100);

      this.progressObserver.next(this.progress);
    };
    */

    xhr.onload = function () {
      var jsonResponse = JSON.parse(xhr.responseText);

      // do something with jsonResponse
      console.log("XHR upload OK! File URLs received in XHR response.");
      console.log(jsonResponse);
    };

    // Send the XHR request to REST endpoint
    xhr.send(formData);
  }

  /**
   * Delete an item from the list of items.
   */
  deleteItem(item) {
    this.items.delete(item);
  }

  /**
   * Navigate to the detail page for this item.
   * Edited by Hillmon on 16/03/2018
   */
  openItem(item: Item) {
    this.navCtrl.push('ItemDetailPage', {
      item: item
    });
  }

  showAlert(message) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
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

  wechatShare(item: Item){
    window.Wechat.isInstalled(function (installed) {
      if (!installed) {
        alert("Wechat not installed");
        return false
      }
    }, function (reason) {
      alert('Failed' + reason);
    });

    window.Wechat.share({
      text: "APS Testing",
      scene: window.Wechat.Scene.TIMELINE   // share to Timeline
    }, function () {
      alert("Success");
    }, function (reason) {
      alert("Failed: " + reason);
    });
  }
  // convert base64 data URI (from camera or file storage) to Blob for XHR upload
  dataURItoBlob(dataURI, dataTYPE) {
    var binary = atob(dataURI.split(',')[1]), array = [];
    for (var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
    return new Blob([new Uint8Array(array)], {type: dataTYPE});
  }
}
