import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Item} from '../../models/item';

@Injectable()
export class Items {
  items: Item[] = [];

  defaultItem: any = {
    "eventName": "Oops, no event yet. Why not create one?"
  };


  constructor(public httpClient:HttpClient) {

  }

  query(params?: any) {
    let items = [
      {
        "eventName": "Oops, no event yet. Why not create one?"
      }
    ];

    let eventsRequest = this.httpClient.get('http://35.185.217.124:8080/event/get-all');

    eventsRequest
      .subscribe(data => {
          console.log('eventsRequest response: ', data);

          items=<any>data;

          for (let item of items) {
            this.items.push(new Item(item));
          }
        },
        err => {
          let errJson = JSON.parse(err.error);
          console.log('Error occurred: '+errJson);
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
