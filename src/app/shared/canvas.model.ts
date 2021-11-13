export enum CanvasMode {
  PAN = 'pan',
  drawing = 'drawing',
}

export interface ICanvas {
  $key: string;
  name: string;
  canvasDataAsJsonString: string;
  user: string;
  shareUser: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
