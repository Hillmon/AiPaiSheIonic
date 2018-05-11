import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Item} from '../../models/item';
import {Api} from "../../providers/api/api";

@Injectable()
export class Items {
  items: Item[] = [];

  defaultItem: any = {
    "eventName": "Oops, no event yet. Why not create one?"
  };


  constructor(public httpClient: HttpClient,
              public api: Api) {

  }

  query(params?: any) {
    this.items = [];

    let items = [
      {
        "eventName": "Oops, no event yet. Why not create one?"
      }
    ];

    let eventsRequest = this.httpClient.get(this.api.url + '/event/get-all');

    eventsRequest
      .subscribe(data => {
          // console.log('eventsRequest response: ', data);

          console.log("In beginning of event http call, items size " + items.length);

          items = <any>data;


          for (let item of items) {

            let posterRequestParams = new HttpParams()
              .set('eventId', item['eventId'])
              .set('fileType', 'poster');

            // console.log("Retrieving posters request "+posterRequestParams);
            this.httpClient.get(this.api.url + '/file/load', {params: posterRequestParams}).subscribe(data => {
                if (data[0]) {
                  item['profilePic'] = data[0]['location'];
                }

                let eventItemWithNoPhoto = new Item(item);

                this.items.push(eventItemWithNoPhoto);

                this.items.sort(function (obj1, obj2) {
                  return obj2["eventId"] - obj1["eventId"];
                });
              },
              err => {
                console.warn(err);
              });
          }
        },
        err => {
          let errJson = JSON.parse(err.error);
          console.log('Error occurred: ' + errJson);
        });

    if (!params) {
      return this.items;
    }

    return this.items.filter((item) => {
      for (let key in params) {
        let field = item[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    });
  }

  add(item: Item) {
    this.items.push(item);
  }

  delete(item: Item) {
    this.items.splice(this.items.indexOf(item), 1);
  }
}
