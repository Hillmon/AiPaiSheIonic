import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Camera, CameraOptions} from '@ionic-native/camera';
import {ActionSheetController, IonicPage, NavController, ViewController} from 'ionic-angular';
import {User} from "../../providers/providers";

declare var google;

@IonicPage()
@Component({
  selector: 'page-item-create',
  templateUrl: 'item-create.html'
})
export class ItemCreatePage {
  @ViewChild('fileInput') fileInput;

  isReadyToSave: boolean;

  item: any;

  form: FormGroup;

  constructor(public navCtrl: NavController,
              public viewCtrl: ViewController,
              formBuilder: FormBuilder,
              public camera: Camera,
              public user: User,
              public actionSheetCtrl: ActionSheetController) {

    // retrieve the login user profile with the user service
    let userProfile = this.user.getLoginUser();

    // TODO timeZone has been hard-coded as GMT+8 for current application context, need to make it versatile depend on system locale
    this.form = formBuilder.group({
      profilePic: [''],
      ownerId: [userProfile['id']],
      eventName: ['', Validators.required],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      timeZone: ['+0800'],
      eventType: ['', Validators.required],
      eventQuota: ['10', Validators.required],
      eventFeeAmt: ['0.00', Validators.required],
      eventVenue: ['', Validators.required]
    });

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.isReadyToSave = this.form.valid;
    });
  }

  ionViewDidLoad() {

  }

  ionViewWillEnter() {
    // Google Places API auto complete
    let input = document.getElementById('venue_input').getElementsByTagName('input')[0];
    let autocomplete = new google.maps.places.Autocomplete(input, {types: ['geocode']});
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      // retrieve the place object for your use
      let place = autocomplete.getPlace();
      console.log('Google API returns place object:');
      console.log(place);

      // update the return address to the UI form
      this.form.patchValue({'eventVenue': place['formatted_address']});

    });
  }

  getPicture() {
    if (Camera['installed']()) {
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      };

      this.camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = 'data:image/jpeg;base64,' + imageData;
        this.form.patchValue({'profilePic': base64Image});
      }, (err) => {
        // Handle error
        console.error(err);
        // alert('Error encountered! Unable to take photo!');
      });
    } else {
      this.fileInput.nativeElement.click();
    }
  }

  // Action Sheet for taking a new photo or selecting from photo gallery
  public showActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [{
        text: 'Load from gallery',
        handler: () => {
          this.loadImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      }, {
        text: 'Take a photo',
        handler: () => {
          this.loadImage(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    actionSheet.present();
  }

  private loadImage(selectedSourceType: number) {
    let cameraOptions: CameraOptions = {
      sourceType: selectedSourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 100,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    };
    this.camera.getPicture(cameraOptions).then((imageData) => {
      if (imageData != null) {
        // Do with the image data what you want.
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = 'data:image/jpeg;base64,' + imageData;
        this.form.patchValue({'profilePic': base64Image});
      }
    });
  }

  processWebImage(event) {
    let reader = new FileReader();
    reader.onload = (readerEvent) => {

      let imageData = (readerEvent.target as any).result;
      this.form.patchValue({'profilePic': imageData});
    };

    if (event.target.files[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  getProfileImageStyle() {
    return 'url(' + this.form.controls['profilePic'].value + ')'
  }

  /**
   * The user cancelled, so we dismiss without sending data back.
   */
  cancel() {
    this.viewCtrl.dismiss();
  }

  /**
   * The user is done and wants to create the item, so return it
   * back to the presenter.
   */
  done() {
    if (!this.form.valid) {
      return;
    }
    this.viewCtrl.dismiss(this.form.value);
  }
}
