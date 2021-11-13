import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PencilSpinnerComponent } from './pencil-spinner/pencil-spinner.component';

@NgModule({
  declarations: [PencilSpinnerComponent],
  imports: [CommonModule],
  exports: [PencilSpinnerComponent],
})
export class SharedModule {}
