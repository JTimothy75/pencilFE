import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule, BUCKET } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import { ToastrService } from './services/toastr.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
  ],
  exports: [
    AngularFireModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
  ],
  providers: [
    { provide: BUCKET, useValue: 'gs://pencil-759fb.appspot.com' },
    ToastrService,
  ],
})
export class CoreModule {}
