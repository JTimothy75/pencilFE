import { Component, OnInit } from '@angular/core';
import { CanvasService } from '../services/canvas.service';
import firebase from 'firebase/app';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable } from 'rxjs';
import { ICanvas } from 'src/app/shared/canvas.model';

@Component({
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit {
  public user: firebase.User = null;
  public myCanvas$: Observable<ICanvas[]>;
  public sharedCanvas$: Observable<ICanvas[]>;

  constructor(
    private authService: AuthService,
    private canvasService: CanvasService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe((u) => {
      this.user = u;
      this.myCanvas$ = this.canvasService.getUserCanvas(this.user.email);
      this.sharedCanvas$ = this.canvasService.getSharedCanvas(this.user.email);
    });
  }

  public createNewCanvas(): void {
    this.canvasService.createNewTrigger(true);
  }
  public openCanvas(id: string): void {
    this.canvasService.openCanvasTrigger(id);
  }
}
