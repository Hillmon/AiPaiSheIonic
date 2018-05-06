import {Component} from '@angular/core';
import {IonicPage, LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';

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
  isLoginUser: boolean;
  alreadyJoin: boolean;
  btnJoinText: string;
  btnJoinAdhocText: string = "Join with Email";
  endpoint: string = "http://35.185.217.124:8080";

  // endpoint: string = "http://localhost:8080";

  constructor(public navCtrl: NavController,
              navParams: NavParams,
              items: Items,
              private loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
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

  joinEventAdHoc() {

    let joinEventAdhocModal = this.modalCtrl.create('JoinEventAdhocPage');
    joinEventAdhocModal.onDidDismiss(participantData => {
      if (participantData) {

        this.presentLoading("Joining the event for you...");

        // retrieve the event profile pic by the event ID
        if (participantData['firstName'] && participantData['lastName'] && participantData['emailAddress'] && this.item['eventId']) {
          const params = new HttpParams()
            .set('eventId', this.item['eventId'])
            .set('firstName', participantData['firstName'])
            .set('lastName', participantData['lastName'])
            .set('email', participantData['emailAddress']);

          this.http.get(this.endpoint + "/eulink/createAdhoc", {params}).subscribe(data => {

              console.log('[Debug] API createAdhoc Return Data: ');
              console.log(data);

              this.loader.dismissAll();

              if (data)
                this.presentToast("You have joined the event successfully");
              else
                this.presentToast("You email is already registered for this event!");


              this.btnJoinAdhocText = "You have joined as " + participantData['emailAddress'];

            },
            err => {
              this.presentToast("System Error: Join Ad-hoc Event Failed!");
              console.error(err);
            });
        }
        else {
          this.presentToast('System Error: Event ID or User ID not found!');
        }
      }
      else {
        this.presentToast('System Error: Participant Data not Found!');
      }
    });
    joinEventAdhocModal.present();
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

          this.loader.dismissAll();
          this.alreadyJoin = true;
          this.btnJoinText = 'You are already in!';

        },
        err => {
          this.presentToast("System Error: Join Event Failed!");
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

    console.info("Current event ID:" + this.item['eventId']);

    // retrieve the login user profile with the user service
    let userProfile = this.user.getLoginUser();

    if (userProfile) {
      this.isLoginUser = true;
      console.info("Current login user profile:");
      console.info(userProfile);

      if (userProfile['id']) {
        console.info("Checking if the login user has joined this event...");

        const params = new HttpParams()
          .set('eventId', this.item['eventId'])
          .set('userId', userProfile['id']);

        this.http.get(this.endpoint + "/eulink/check", {params}).subscribe(data => {

            this.loader.dismissAll();

            if (data) {
              this.alreadyJoin = true;
              this.btnJoinText = 'You are already in!';
            }
            else {
              this.alreadyJoin = false;
              this.btnJoinText = 'Join this event!';
            }
          },
          err => {
            this.presentToast("Checking event-user link error!");
            console.error(err);
          });
      }
    }
    else {
      this.isLoginUser = false;
      this.presentToast('Login User cannot be found! Join Event in Ad-hoc Mode.');
      console.info("No login user can be found!");
    }
  }

}
