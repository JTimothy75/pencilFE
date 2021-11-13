import { Component, OnInit } from '@angular/core';
import { CanvasService } from '../services/canvas.service';
import firebase from 'firebase/app';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable } from 'rxjs';
import { ICanvas } from 'src/app/shared/canvas.model';
import { tap } from 'rxjs/Operators';

@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit {
  public user: firebase.User = null;
  public myCanvas$: Observable<ICanvas[]>;
  public sharedCanvas$: Observable<ICanvas[]>;
  public myDesignIsLoading: boolean = false;
  public shareDesignIsLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private canvasService: CanvasService
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  public getUserData(): void {
    this.myDesignIsLoading = true;
    this.shareDesignIsLoading = true;
    this.authService.user$.subscribe((u) => {
      this.myDesignIsLoading = false;
      this.shareDesignIsLoading = false;
      this.user = u;
      this.loadMyDesign();
      this.loadSharedDesign();
    });
  }

  public loadMyDesign(): void {
    this.myDesignIsLoading = true;
    this.myCanvas$ = this.canvasService.getUserCanvas(this.user.email).pipe(
      tap(() => {
        this.myDesignIsLoading = false;
      })
    );
  }
  public loadSharedDesign(): void {
    this.shareDesignIsLoading = true;
    this.sharedCanvas$ = this.canvasService
      .getSharedCanvas(this.user.email)
      .pipe(
        tap(() => {
          this.shareDesignIsLoading = false;
        })
      );
  }

  public createNewCanvas(): void {
    this.canvasService.createNewTrigger(true);
  }
  public openCanvas(id: string): void {
    this.canvasService.openCanvasTrigger(id);
  }
}
