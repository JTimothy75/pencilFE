import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { Observable } from 'rxjs';
import { CanvasService } from '../services/canvas.service';
import { CanvasMode, ICanvas } from 'src/app/shared/canvas.model';
import { AuthService } from 'src/app/core/services/auth.service';
import firebase from 'firebase/app';

@Component({
  selector: 'canvas-display',
  templateUrl: './canvas-display.component.html',
  styleUrls: ['./canvas-display.component.scss'],
})
export class CanvasDisplayComponent implements OnInit {
  public mouseDown: boolean;
  public strokeWidth: number;
  public canvasID: string;
  public currentMode: string = null;
  public strokeColor: string;
  public activeCanvas: ICanvas;
  private canvas: fabric.Canvas;
  public user: firebase.User = null;
  public modes = CanvasMode;

  private size: any = {
    width: 600,
    height: 450,
  };

  constructor(
    private canvasService: CanvasService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((u) => {
      this.user = u;
      this.initCanvas('canvas');

      this.canvasService.getUserCanvas(this.user.email).subscribe((can) => {
        can.length > 0 ? this.loadLastCanvas(can) : this.newCanvas();
      });

      this.setAutoSave();
      this.setCanvasProperty();
    });

    this.setCanvasAction();

    this.canvasService.createNew$.subscribe((val) => {
      if (val) {
        this.currentMode = null;
        this.canvasID = null;
        this.canvas.clear();
        this.newCanvas();
      }
    });

    this.canvasService.openCanvas$.subscribe((id) => {
      if (id) {
        this.currentMode = null;
        this.canvasID = null;
        this.canvas.clear();

        this.loadExistingCanvas(id);
      }
    });
  }

  public setCanvasAction(): void {
    this.canvasService.isDrawingMode$.subscribe((mode: CanvasMode) => {
      this.setDrawingMode(mode);
    });

    this.canvasService.isPaningMode$.subscribe((mode) => {
      this.currentMode = mode;
      this.canvas.isDrawingMode = false;
    });

    this.canvasService.penColor$.subscribe((color) => {
      this.canvas.freeDrawingBrush.color = color;
    });

    this.canvasService.addImage$.subscribe((imgURL) => {
      this.addImage(imgURL);
    });
  }

  public setDrawingMode(mode: CanvasMode): void {
    if (mode === this.modes.drawing) {
      this.currentMode = mode;
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.width = 4;
    } else {
      if (this.canvas) {
        this.canvas.isDrawingMode = false;
        this.currentMode = null;
      }
    }
  }

  public addImage(url: string): void {
    fabric.Image.fromURL(url, (img) => {
      img.scale(0.2);
      img.crossOrigin = 'allow-credentials';
      this.canvas.add(img);
      const newCanvae: ICanvas = JSON.parse(JSON.stringify(this.activeCanvas));
      newCanvae.canvasDataAsJsonString = this.ExportToContent();
      this.canvasService.updateCanvas(newCanvae);
    });
  }

  public setAutoSave(): void {
    this.canvas.on('path:created', (event) => {
      this.saveCanvasUpdate();
    });

    this.canvas.on('object:moved', (event) => {
      this.saveCanvasUpdate();
    });

    this.canvas.on('object:rotated', (event) => {
      this.saveCanvasUpdate();
    });

    this.canvas.on('object:scaled', (event) => {
      this.saveCanvasUpdate();
    });
  }

  public saveCanvasUpdate(): void {
    const newCanvae: ICanvas = JSON.parse(JSON.stringify(this.activeCanvas));
    newCanvae.canvasDataAsJsonString = this.ExportToContent();
    this.canvasService.updateCanvas(newCanvae);
  }

  public newCanvas(): void {
    const newCanvas: ICanvas = {
      $key: '',
      active: true,
      canvasDataAsJsonString: this.ExportToContent(),
      createdAt: null,
      updatedAt: null,
      name: `Canvas${this.randomId()}`,
      shareUser: [],
      user: this.user.email,
    };

    this.canvasService.storeNewCanvas(newCanvas).subscribe((data) => {
      this.canvasID = data;
      this.canvasService.setCurrentCanvasId(this.canvasID);
      this.canvasService
        .getCanvas(data)
        .subscribe((canvas) => (this.activeCanvas = <ICanvas>canvas));
    });
  }

  public loadLastCanvas(can: ICanvas[]): void {
    this.activeCanvas = can[can.length - 1];
    this.canvasID = can[can.length - 1].$key;
    this.canvasService.setCurrentCanvasId(this.canvasID);
    this.restoreCanvas(this.activeCanvas.canvasDataAsJsonString);
  }

  public loadExistingCanvas(id: string): void {
    this.canvasService.getCanvas(id).subscribe((canvas) => {
      this.activeCanvas = canvas;
      this.canvasID = id;
      this.canvasService.setCurrentCanvasId(id);
      this.restoreCanvas(this.activeCanvas.canvasDataAsJsonString);
    });
  }

  public setCanvasProperty(): void {
    this.canvas.on('mouse:down', ($event) => {
      this.mouseDown = true;
      if (this.currentMode && this.modes.PAN) {
        this.canvas.setCursor('grab');
      }

      this.canvas.getObjects().forEach((o) => {
        o.cornerStyle = 'circle';
        o.cornerColor = '#fff';
        o.transparentCorners = false;
        o.cornerStrokeColor = '#000';
      });
    });

    this.canvas.on('mouse:move', ($event) => {
      if (this.mouseDown && this.currentMode === this.modes.PAN) {
        this.canvas.setCursor('grab');
        const mEvent = $event.e;
        const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
        this.canvas.relativePan(delta);
      }
    });

    this.canvas.on('mouse:up', () => {
      this.mouseDown = false;
    });
  }

  public initCanvas(id: string): void {
    this.canvas = new fabric.Canvas(id, {
      backgroundColor: '#ebebef',
      hoverCursor: 'pointer',
      selection: false,
      selectionBorderColor: 'blue',
    });
    this.canvas.setWidth(this.size.width);
    this.canvas.setHeight(this.size.height);
  }

  public randomId(): number {
    return Math.floor(Math.random() * 999999) + 1;
  }

  public ExportToContent(): string {
    return JSON.stringify(this.canvas.toJSON());
  }

  public restoreCanvas(canvasASJson: string): void {
    this.canvas.loadFromJSON(
      JSON.parse(canvasASJson),
      this.canvas.renderAll.bind(this.canvas)
    );
  }
}
