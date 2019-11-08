import {Component, OnInit } from '@angular/core';

import {OrgTree} from '../models/org-tree.model';
import {DataTreeService} from '../../core/data-tree.service';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material';
import {FlatTreeControl} from '@angular/cdk/tree';
import {of} from 'rxjs';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {OrgFlatNode} from '../models/org-flat-node.model';
import OrgTreeNode from '../models/org-tree-node.model';

// MOCK DATA

const organizationTree: OrgTree = {
  class: 'organizationTree',
  data: [
    {id: 1, title: 'Branch 1'},
    {id: 2, title: 'Branch 2', parent: 1},
    {id: 3, title: 'Branch 3'},
    {id: 4, title: 'Branch 4', parent: 3},
    {id: 5, title: 'Branch 5', parent: 4},
    {id: 6, title: 'Branch 6', parent: 4},
    {id: 7, title: 'Branch 7', parent: 5},
    {id: 8, title: 'Branch 8', parent: 5},
    {id: 9, title: 'Branch 9', parent: 6},
  ]
};

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})

export class TreeComponent implements OnInit {
  treeControl: FlatTreeControl<OrgFlatNode>;
  treeFlattener: MatTreeFlattener<OrgTreeNode, OrgFlatNode>;
  dataSource: MatTreeFlatDataSource<OrgTreeNode, OrgFlatNode>;
  expandedNodeSet = new Set<number>();

  transformer = (node, level: number) => {
    return {
      expandable: !!node.children,
      title: node.title,
      level,
      id: node.id,
      children: node.children
    };
  }

  hasChild = (_: number, nodeData) => !!nodeData.children;

  private getLevel = (node) => node.level;
  private isExpandable = (node) => !!node.children;
  private getChildren = (node) => of(node.children);


  constructor(private dataTreeService: DataTreeService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    this.dataSource.data = this.dataTreeService.createNestedTree(organizationTree.data, 0);
  }


  visibleNodes() {
    const result = [];
    this.rememberExpandedTreeNodes(this.treeControl, this.expandedNodeSet);
    this.dataSource.data.forEach(node => {
      this.addExpandedChildren(node, this.expandedNodeSet, result);
    });
    return result;
  }


  drop(event: CdkDragDrop<string[]>) {
    if (!event.isPointerOverContainer) return;

    const visibleNodes = this.visibleNodes();

    // deep clone the data source so we can mutate it
    const changedData = JSON.parse(JSON.stringify(this.dataSource.data));

    // remove the node from its old place
    const node = event.item.data;
    const siblings = this.findNodeSiblings(changedData, node.id);
    const siblingIndex = siblings.findIndex(n => n.id === node.id);
    const nodeToInsert = siblings.splice(siblingIndex, 1)[0];

    // determine where to insert the node
    const nodeAtDest = visibleNodes[event.currentIndex];

    if (nodeAtDest.id === nodeToInsert.id) return;

    // determine drop index relative to destination array
    let relativeIndex = event.currentIndex; // default if no parent
    const nodeAtDestFlatNode = this.treeControl.dataNodes.find(n => nodeAtDest.id === n.id);
    const parent = this.getParentNode(nodeAtDestFlatNode);
    if (parent) {
      const parentIndex = visibleNodes.findIndex(n => n.id === parent.id) + 1;
      relativeIndex = event.currentIndex - parentIndex;
    }

    // insert node
    const newSiblings = this.findNodeSiblings(changedData, nodeAtDest.id);

    if (!newSiblings) return;

    newSiblings.splice(relativeIndex, 0, nodeToInsert);

    // rebuild tree with mutated data
    this.rebuildTreeForData(changedData);
  }

  rebuildTreeForData(data: any) {
    this.rememberExpandedTreeNodes(this.treeControl, this.expandedNodeSet);
    this.dataSource.data = data;
    this.forgetMissingExpandedNodes(this.treeControl, this.expandedNodeSet);
    this.expandNodesById(this.treeControl.dataNodes, Array.from(this.expandedNodeSet));
  }

  private rememberExpandedTreeNodes(
    treeControl: FlatTreeControl<OrgFlatNode>,
    expandedNodeSet: Set<number>
  ) {
    if (treeControl.dataNodes) {
      treeControl.dataNodes.forEach((node) => {
        if (treeControl.isExpandable(node) && treeControl.isExpanded(node)) {
          // capture latest expanded state
          expandedNodeSet.add(node.id);
        }
      });
    }
  }

  private forgetMissingExpandedNodes(
    treeControl: FlatTreeControl<OrgFlatNode>,
    expandedNodeSet: Set<number>
  ) {
    if (treeControl.dataNodes) {
      expandedNodeSet.forEach((nodeId) => {
        // maintain expanded node state
        if (!treeControl.dataNodes.find((n) => n.id === nodeId)) {
          // if the tree doesn't have the previous node, remove it from the expanded list
          expandedNodeSet.delete(nodeId);
        }
      });
    }
  }

  private expandNodesById(flatNodes: OrgFlatNode[], ids: number[]) {
    if (flatNodes && flatNodes.length) {
      const idSet = new Set(ids);
      return flatNodes.forEach((node) => {
        if (idSet.has(node.id)) {
          this.treeControl.expand(node);
          let parent = this.getParentNode(node);
          while (parent) {
            this.treeControl.expand(parent);
            parent = this.getParentNode(parent);
          }
        }
      });
    }
  }

  private getParentNode(node: OrgFlatNode) {
    const currentLevel = node.level;
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (currentNode.level < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  private addExpandedChildren(node: OrgTreeNode, expanded: Set<number>, result) {
    result.push(node);
    if (expanded.has(node.id)) {
      node.children.map(child => this.addExpandedChildren(child, expanded, result));
    }
  }

  // recursive find function to find siblings of node
  private findNodeSiblings(arr: Array<any>, id: string): Array<any> {
    let result, subResult;
    arr.forEach(item => {
      if (item.id === id) {
        result = arr;
      } else if (item.children) {
        subResult = this.findNodeSiblings(item.children, id);
        if (subResult) result = subResult;
      }
    });
    return result;
  }
}
