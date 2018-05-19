import {Component} from '@angular/core';
import {IonicPage, LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';

import {Items} from '../../providers/providers';
import {HttpClient, HttpParams} from "@angular/common/http";

import {format} from 'date-fns';
import {User} from "../../providers/user/user";
import {Api} from "../../providers/api/api";

@IonicPage({
  name: 'ItemDetailPage',
  segment: 'item-detail/:eventId'
})
@Component({
  selector: 'page-item-detail',
  templateUrl: 'item-detail.html'
})
export class ItemDetailPage {
  eventId: any;
  item: any;
  eventDateStr: string;
  eventTimeStr: string;
  loader: any;
  isLoginUser: boolean;
  alreadyJoin: boolean;
  btnJoinText: string;
  btnJoinAdhocText: string = "Join with Email";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public items: Items,
              private loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public http: HttpClient,
              public toastCtrl: ToastController,
              public user: User,
              public api: Api) {

    this.eventId = this.navParams.get('eventId');
    this.item = this.items.defaultItem;
    // this.item = navParams.get('item') || items.defaultItem;

    //item is null, redirect to list master
    /*
    if (this.item == items.defaultItem) {
      console.log("item is null, navigating to item list page");
      this.navCtrl.push(MainPage);
    }
    */
  }

  ionViewWillEnter() {
    // ionViewWillEnter contains things you want done each time the page becomes the active view

    // retrieve the event profile pic by the event ID
    if (this.eventId) {
      const params = new HttpParams()
        .set('eventId', this.eventId)
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
    if (this.eventId && this.user.getLoginUser()) {

      const params = new HttpParams()
        .set('eventId', this.eventId)
        .set('userId', this.user.getLoginUser()['id']);

      this.http.get(this.api.url + '/eulink/participantList', {params}).subscribe(data => {
        console.log('Response from /eulink/participantList');
        console.log(data);
        this.item['participantList'] = data;
      })
    }

  }

  ionViewDidLoad() {
    // ionViewDidLoad contains things you only want created once per instantiation of the page

    // retrieve the user name by the user ID
    if (this.eventId) {

      const params = new HttpParams()
        .set('id', this.eventId);

      this.http.get(this.api.url + '/event/get', {params}).subscribe(data => {

          if (data) {
            for (let dataItem in data) {
              console.log('[Debug] Event property loaded from API: ' + dataItem + " = " + data[dataItem]);
            }
            this.item = data;

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

            //TODO bug is found here, if the eventDate is retrieved from get-all method, it is a long date, if it is passed from create event page, it is just a date string.
            var date = new Date(this.item['eventDate']);
            this.eventDateStr = format(date, 'DD/MM/YYYY');
            this.eventTimeStr = format(date, 'hh:mm A');

          }
        },
        err => {
          this.presentToast('Retrieve event data error!');
          console.error(err);
        });

      // Check if the current login user has already joined this event
      this.checkEvent();
    }
    else {
      this.presentToast('System error: event data not found!');
    }
  }

  joinEventAdHoc() {
    let joinEventAdhocModal = this.modalCtrl.create('JoinEventAdhocPage');
    joinEventAdhocModal.onDidDismiss(participantData => {
      if (participantData) {

        this.presentLoading("Joining the event for you...");

        // retrieve the event profile pic by the event ID
        if (participantData['firstName'] && participantData['lastName'] && participantData['emailAddress'] && this.eventId) {
          const params = new HttpParams()
            .set('eventId', this.eventId)
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
    if (this.eventId && userProfile['id']) {
      const params = new HttpParams()
        .set('eventId', this.eventId)
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

    console.info("Current event ID:" + this.eventId);

    // retrieve the login user profile with the user service
    let userProfile = this.user.getLoginUser();

    if (userProfile) {
      this.isLoginUser = true;
      console.info("Current login user profile:");
      console.info(userProfile);

      if (userProfile['id']) {
        console.info("Checking if the login user has joined this event...");

        const params = new HttpParams()
          .set('eventId', this.eventId)
          .set('userId', userProfile['id']);

        this.http.get(this.api.url + '/eulink/check', {params}).subscribe(data => {

            this.loader.dismiss();

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
            this.loader.dismiss();
            this.presentToast("Checking event-user link error!");
            console.error(err);
          });
      }
    }
    else {
      this.loader.dismiss();
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
