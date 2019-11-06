import {Component, OnInit} from '@angular/core';
import {OrgTree} from '../models/org-tree.model';
import {DataTreeService} from '../../core/data-tree.service';
import OrgTreeNode from '../models/org-tree-node.model';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})

export class TreeComponent implements OnInit {
  organizationTreeTransformed: OrgTreeNode[];

  treeControl = new NestedTreeControl<OrgTreeNode>(node => node.children);

  dataSource = new MatTreeNestedDataSource<OrgTreeNode>();

  organizationTree: OrgTree = {
    class: 'organizationTree',
    data: [
      { id: 1, title: 'Branch 1' },
      { id: 2, title: 'Branch 21', parent: 1 },
      { id: 3, title: 'Branch 2' },
      { id: 4, title: 'Branch 21', parent: 3 },
      { id: 5, title: 'Branch 25', parent: 4 },
      { id: 6, title: 'Branch 26', parent: 4 },
      { id: 7, title: 'Branch 27', parent: 5 },
      { id: 8, title: 'Branch 28', parent: 5 },
      { id: 9, title: 'Branch 29', parent: 6 },
    ]
  };

  constructor(private dataTreeService: DataTreeService) {}

  hasChild = (_: number, node: OrgTreeNode) => !!node.children && node.children.length > 0;

  ngOnInit() {
    this.organizationTreeTransformed = this.dataTreeService.createNestedTree(this.organizationTree.data);
    this.dataSource.data = this.organizationTreeTransformed;
  }
}

