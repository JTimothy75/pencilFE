import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CanvasService } from '../services/canvas.service';
import { Observable } from 'rxjs';
import { ToastrService } from 'src/app/core/services/toastr.service';
import { CanvasMode } from 'src/app/shared/canvas.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent implements OnInit {
  public currentCanvasId: string;
  public internalCurrentMode: string = null;
  public uploadPercent: Observable<number>;
  public imageUpload$: Observable<number>;
  public searchForm: FormGroup;
  public colorFormControl: FormControl = new FormControl('#1768AC');
  public share: FormControl;
  public modes = CanvasMode;

  constructor(
    private router: Router,
    private canvasService: CanvasService,
    private toastrService: ToastrService,
    private authService: AuthService
  ) {}

  public ngOnInit(): void {
    this.colorFormControl.valueChanges.subscribe((e) => {
      this.canvasService.changePenColor(e);
    });

    this.share = new FormControl('');

    this.searchForm = new FormGroup({
      share: this.share,
    });

    this.imageUpload$ = this.canvasService.imageUploadPercent$;
    this.canvasService.currentCanvasId$.subscribe(
      (id) => (this.currentCanvasId = id)
    );

    this.canvasService.isDrawingMode$.subscribe((mode: CanvasMode) => {
      this.internalCurrentMode = mode;
    });

    this.canvasService.isPaningMode$.subscribe((mode) => {
      this.internalCurrentMode = mode;
    });
  }

  public togglePan(): void {
    if (this.internalCurrentMode === this.modes.PAN) {
      this.canvasService.setIsPaning(null);
    } else {
      this.canvasService.setIsDrawing(null);
      this.canvasService.setIsPaning(this.modes.PAN);
    }
  }
  public togglePen(): void {
    if (this.internalCurrentMode === this.modes.drawing) {
      this.canvasService.setIsDrawing(null);
    } else {
      this.canvasService.changePenColor(this.colorFormControl.value);
      this.canvasService.setIsDrawing(this.modes.drawing);
    }
  }

  public shareCanvas(value: { share: string }): void {
    this.canvasService.shareCanvas(this.currentCanvasId, value.share).subscribe(
      () => {
        this.searchForm.controls.share.reset();
        this.toastrService.success(
          `This design has been shared with ${value.share}`,
          'Success'
        );
      },
      (err) => {
        this.toastrService.warning(` ${err}`);
      }
    );
  }

  public dragOver(e: DragEvent, self: HTMLDivElement): void {
    e.preventDefault();
    self.classList.add('drag-over');
  }

  public dragLeave(e: DragEvent, self: HTMLDivElement): void {
    e.preventDefault();
    self.classList.remove('drag-over');
  }

  public cancelDrag(e: DragEvent): void {
    e.preventDefault();
  }

  public drop($event: DragEvent, self: HTMLDivElement): void {
    this.cancelDrag($event);
    self.classList.remove('drag-over');
    let transDataFile: any = $event.dataTransfer.files;
    [...transDataFile].forEach((e) => {
      this.addImage(e);
    });
  }

  public fileChangeEvent($event: HTMLInputEvent): void {
    this.addImage($event.target.files[0]);
  }

  public addImage(file: File): void {
    this.canvasService.setIsPaning(null);
    this.canvasService.setIsDrawing(null);
    this.canvasService.uploadImage(file).subscribe();
  }

  public logout(): void {
    this.authService.logoutUser().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
