import { Injectable } from '@angular/core';
import OrgTreeNode from '../tree-view/models/org-tree-node.model';

@Injectable({
  providedIn: 'root'
})
export class DataTreeService {

  constructor() { }

  createNestedTree(nodes: OrgTreeNode[], parent: number = 0) {
    const result: OrgTreeNode[] = [];
    Object.values(nodes).forEach((node: OrgTreeNode) => {
      if (!node.parent) {
        node.parent = 0;
      }

      if (node.parent === parent) {
        const children = this.createNestedTree(nodes, node.id);
        if (children.length) {
          node.children = children;
        }
        result.push(node);
      }
    });
    return result;
  }
}
