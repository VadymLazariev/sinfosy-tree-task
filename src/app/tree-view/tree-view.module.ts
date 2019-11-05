import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TreeViewRoutingModule } from './tree-view-routing.module';
import { TreeComponent } from './tree/tree.component';
import {MaterialModule} from '../material/material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [TreeComponent],
  imports: [
    CommonModule,
    TreeViewRoutingModule,
    MaterialModule,
    DragDropModule
  ]
})
export class TreeView { }
