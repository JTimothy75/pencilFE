import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxColorsModule } from 'ngx-colors';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { CanvasComponent } from './canvas.component';
import { CanvasDisplayComponent } from './canvas-display/canvas-display.component';
import { SideBarComponent } from './side-bar/side-bar.component';

@NgModule({
  declarations: [ToolBarComponent, CanvasComponent, CanvasDisplayComponent, SideBarComponent],
  imports: [CommonModule, ReactiveFormsModule, NgxColorsModule],
})
export class CanvasModule {}
