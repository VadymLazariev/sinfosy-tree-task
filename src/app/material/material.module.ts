import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule, MatIconModule} from '@angular/material';
import {MatTreeModule} from '@angular/material/tree';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatTreeModule,
    MatButtonModule
  ],
  exports: [
    MatIconModule,
    MatExpansionModule,
    MatTreeModule,
    MatButtonModule
  ]
})
export class MaterialModule { }
