import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Observable, from, Subject, throwError } from 'rxjs';
import { finalize, map, switchMap, take, takeLast, tap } from 'rxjs/Operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { ICanvas } from 'src/app/shared/canvas.model';

@Injectable({
  providedIn: 'root',
})
export class CanvasService {
  public readonly isDrawingMode$ = new Subject<string>();
  public readonly isPaningMode$ = new Subject<string>();
  public readonly addImage$ = new Subject<string>();
  public readonly penColor$ = new Subject<string>();
  public readonly imageUploadPercent$ = new Subject<number>();
  public readonly currentCanvasId$ = new Subject<string>();
  public readonly createNew$ = new Subject<boolean>();
  public readonly openCanvas$ = new Subject<string>();

  constructor(
    private authService: AuthService,
    private angularFirestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  public setIsDrawing(value: string): void {
    this.isDrawingMode$.next(value);
  }

  public setIsPaning(value: string): void {
    this.isPaningMode$.next(value);
  }

  public changePenColor(value: string): void {
    this.penColor$.next(value);
  }

  public addNewImage(value: string): void {
    this.addImage$.next(value);
  }

  public setCurrentCanvasId(value: string): void {
    this.currentCanvasId$.next(value);
  }

  public createNewTrigger(value: boolean): void {
    this.createNew$.next(value);
  }
  public openCanvasTrigger(value: string): void {
    this.openCanvas$.next(value);
  }

  public uploadImage(
    Image: File
  ): Observable<firebase.storage.UploadTaskSnapshot> {
    const filePath = `canvas-image/${Image.name}`;
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(`canvas-image/${Image.name}`, Image);
    task.percentageChanges().subscribe((perc) => {
      this.imageUploadPercent$.next(perc);
    });
    return task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          this.imageUploadPercent$.next(null);
          return this.addNewImage(url);
        });
      })
    );
  }

  public storeNewCanvas(canvas: ICanvas): Observable<string> {
    const id = this.angularFirestore.createId();
    canvas.$key = id;
    canvas.createdAt = new Date();
    canvas.updatedAt = canvas.createdAt;
    return from(this.angularFirestore.doc('/canvas/' + id).set(canvas)).pipe(
      map(() => id)
    );
  }

  public updateCanvas(canvas: ICanvas): Observable<void> {
    canvas.updatedAt = new Date();
    return from(
      this.angularFirestore.doc('/canvas/' + canvas.$key).set(canvas)
    );
  }

  public shareCanvas(canvasId: string, sharedUser: string): Observable<void> {
    return this.angularFirestore
      .doc('/canvas/' + canvasId)
      .get()
      .pipe(
        switchMap((canvas: firebase.firestore.DocumentSnapshot<ICanvas>) => {
          const newCanvas = canvas.data();
          return this.authService.user$.pipe(
            switchMap((user) => {
              if (user.email === newCanvas.user) {
                newCanvas.shareUser.push(sharedUser);
                return from(
                  this.angularFirestore
                    .doc('/canvas/' + canvas.data().$key)
                    .set(newCanvas)
                );
              } else {
                return throwError('There design does not belong to you!');
              }
            })
          );
        }),
        take(1)
      );
  }

  public getCanvas(id: string): Observable<ICanvas> {
    return <Observable<ICanvas>>(
      this.angularFirestore.doc('/canvas/' + id).valueChanges()
    );
  }

  public getLastModifiedCanvas(user: string): Observable<ICanvas[]> {
    return <Observable<ICanvas[]>>(
      this.angularFirestore
        .collection('canvas', (ref) =>
          ref.where('user', '==', user).orderBy('updatedAt')
        )
        .valueChanges()
    );
  }

  public getUserCanvas(user: string): Observable<ICanvas[]> {
    return <Observable<ICanvas[]>>(
      this.angularFirestore
        .collection('canvas', (ref) =>
          ref.where('user', '==', user).orderBy('updatedAt')
        )
        .valueChanges()
    );
  }

  public getSharedCanvas(user: string): Observable<ICanvas[]> {
    return <Observable<ICanvas[]>>(
      this.angularFirestore
        .collection('canvas', (ref) =>
          ref.where('shareUser', 'array-contains', user)
        )
        .valueChanges()
    );
  }
}
