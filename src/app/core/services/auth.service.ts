import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/Operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedIn: boolean;
  private user = new BehaviorSubject(this.angularFireAuth.authState);
  public user$: Observable<firebase.User | null> = this.user.pipe(
    switchMap((user) => user)
  );

  constructor(private angularFireAuth: AngularFireAuth) {
    this.angularFireAuth.onAuthStateChanged((user) => {
      if (user) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  public loginUserWithGoogle(): Observable<firebase.auth.UserCredential> {
    return from(
      this.angularFireAuth.signInWithPopup(
        new firebase.auth.GoogleAuthProvider()
      )
    );
  }

  public logoutUser(): Observable<void> {
    return from(this.angularFireAuth.signOut());
  }
}
