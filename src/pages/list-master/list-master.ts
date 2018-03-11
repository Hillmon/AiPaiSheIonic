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
import {FileTransfer, FileTransferObject, FileUploadOptions} from "@ionic-native/file-transfer";

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
              private transfer: FileTransfer,
              public toastCtrl: ToastController) {
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

        for (let param in item) {
          console.log('[Debug] Parameter Found: ' + param + " = " + item[param]);
        }

        const params = new HttpParams()
          .set('owner', item['owner'])
          .set('date', item['date'] + ' ' + item['time'])
          .set('name', item['name'])
          .set('venue', item['venue'])
          .set('type', item['type'])
          .set('quota', item['quota']);

        // create a new event via REST API
        this.http.get("http://35.185.217.124:8080/event/create", {params}).subscribe(data => {
            console.log('Create event result: ', data);
            this.showAlert('Your new event has been created! Please share it to invite people to join!');

            // load dummy image from GCP Storage if the profile pic does not exist
            if (item['profilePic'] == '') {
              item['profilePic'] = 'https://storage.googleapis.com/aipaishe/exercise-fitness.png';
            }
            else {
              // upload the poster to cloud storage
              // upload the profile pic to cloud storage

              console.log("uploading the poster for new event: " + data['eventId']);
              this.uploadFile(item['profilePic'], data['eventId']);
            }

            // open the page for the newly created event
            this.navCtrl.push('ItemDetailPage', {
              item: item
            });
          },
          err => {
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
    });
    addModal.present();
  }

  uploadFile(imgData: any, eventId: any) {
    let apiUrl = 'http://localhost:8080/upload2cloud';

    let loader = this.loadingCtrl.create({
      content: "Uploading the photo..."
    });
    loader.present();

    const fileTransfer: FileTransferObject = this.transfer.create();

    let options: FileUploadOptions = {
      fileKey: 'ionicfile',
      fileName: 'ionicfile',
      chunkedMode: false,
      mimeType: "image/jpeg",
      params: {
        "eventId": eventId,
        "eventName": 'Upload Test'
      },
      headers: {}
    };

    /*
    fileTransfer.onProgress((e)=>
    {
      this.prg=(e.lengthComputable) ?  Math.round((e.loaded * 100) / e.total) : -1;
      this.changeDetectorRef.detectChanges();
    });
    */

    /*
    fileTransfer.upload('https://storage.googleapis.com/aipaishe/exercise-fitness.png', apiUrl, options).then((res) =>
    {
      console.log(JSON.stringify(res));
      loader.dismissAll();
    },(err)=> {
      this.showAlert(err);
      console.error(err);
    });

    */

    fileTransfer.upload(imgData, encodeURI(apiUrl), options)
      .then((data) => {
        console.log(data + " Uploaded Successfully");
        // this.imageFileName = "http://192.168.0.7:8080/static/images/ionicfile.jpg"
        loader.dismiss();
        this.presentToast("Image uploaded successfully");
      }, (err) => {
        console.log(err);
        loader.dismiss();
        this.presentToast(err);
      });

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
}
