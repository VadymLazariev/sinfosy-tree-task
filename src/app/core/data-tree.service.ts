import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataTreeService {

  constructor() { }

  createNestedTree(items, id = null, level = 1, link = 'parent') {
    return items
      .filter(item => {
        if (!item.hasOwnProperty(link)) {
          item.parent = 0;
        }
        return item[link] === id;
      })
      .map(item => {
        return  {...item, ...{ children: this.createNestedTree(items, item.id, level + 1)}, ...{ level, }};
      });
  }
}
