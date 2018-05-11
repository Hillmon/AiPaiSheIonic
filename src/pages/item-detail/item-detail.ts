import {Component} from '@angular/core';
import {IonicPage, LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';

import {Items} from '../../providers/providers';
import {HttpClient, HttpParams} from "@angular/common/http";

import {format} from 'date-fns';
import {User} from "../../providers/user/user";
import {MainPage} from "../pages";
import {Api} from "../../providers/api/api";

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

  constructor(public navCtrl: NavController,
              navParams: NavParams,
              items: Items,
              private loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public http: HttpClient,
              public toastCtrl: ToastController,
              public user: User,
              public api: Api) {
    this.item = navParams.get('item') || items.defaultItem;

    //item is null, redirect to list master
    if (this.item == items.defaultItem) {
      console.log("item is null, navigating to item list page");
      this.navCtrl.push(MainPage);
    }

    for (let param in this.item) {
      console.log('[Debug] Item property found: ' + param + " = " + this.item[param]);
    }

    // retrieve the user name by the user ID
    if (this.item['ownerId']) {
      const params = new HttpParams()
        .set('id', this.item['ownerId']);

      this.http.get(this.api.url + '/user/get', {params}).subscribe(data => {

          if (data) {
            this.item['ownerName'] = data['lastName'] + ' ' + data['firstName'];
            this.item['ownerPhoneNo'] = data['phoneNo'];
          } else {
            this.item['ownerName'] = 'Unknown User';
            this.item['ownerPhoneNo'] = 'N/A';
          }

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

      this.http.get(this.api.url + '/file/load', {params}).subscribe(data => {

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

    //retrieve participantList if any
    if (this.item['eventId'] && this.user.getLoginUser()) {

      const params = new HttpParams().set('eventId', this.item['eventId'])
        .set('userId', this.user.getLoginUser()['id']);

      this.http.get(this.api.url + '/eulink/participantList', {params}).subscribe(data => {
        console.log('Response from /eulink/participantList');
        console.log(data);
        this.item['participantList'] = data;
      })
    }


    //TODO bug is found here, if the eventDate is retrieved from get-all method, it is a long date, if it is passed from create event page, it is just a date string.
    var date = new Date(this.item['eventDate']);
    this.eventDateStr = format(date, 'DD/MM/YYYY');
    this.eventTimeStr = format(date, 'hh:mm A');
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
            .set('email', participantData['emailAddress'])
            .set('phoneNo', participantData['phoneNo'])
          ;

          this.http.get(this.api.url + '/eulink/createAdhoc', {params}).subscribe(data => {

              console.log('[Debug] API createAdhoc Return Data: ');
              console.log(data);

              this.loader.dismissAll();

              if (this.isEmpty(data)){
                this.presentToast("Your email is already registered for this event!");
              } else{
                this.presentToast("You have joined the event successfully");
              }

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

      this.http.get(this.api.url + '/eulink/create', {params}).subscribe(data => {

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

        this.http.get(this.api.url + '/eulink/check', {params}).subscribe(data => {

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

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }

  isDefined(obj){
    return typeof obj!=="undefined";
  }
}
