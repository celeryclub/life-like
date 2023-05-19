import { PIXEL_RATIO, NATURAL_CELL_SIZE, SIDEBAR_WIDTH } from "../../Constants";
import { LayoutModel } from "../models/LayoutModel";
import { RenderSystem } from "../systems/RenderSystem";

export enum Direction {
  Up = "Up",
  Right = "Right",
  Down = "Down",
  Left = "Left",
}

const ZOOM_INTENSITY = 0.01;
const MIN_ZOOM_FACTOR = 0.1; // 10%
const MAX_ZOOM_FACTOR = 64.0; // 6400%

export class LayoutController {
  private _layoutModel: LayoutModel;
  private _renderSystem: RenderSystem;
  private _canvas!: HTMLCanvasElement;

  constructor(layoutModel: LayoutModel, renderSystem: RenderSystem, canvasPromise: Promise<HTMLCanvasElement>) {
    this._layoutModel = layoutModel;
    this._renderSystem = renderSystem;

    canvasPromise.then(canvas => {
      this._canvas = canvas;

      this.fitCanvasToWindow();
      this.recenterOffset();
    });

    this.fitCanvasToWindow = this.fitCanvasToWindow.bind(this);
    this.translateOffset = this.translateOffset.bind(this);
    this.recenterOffset = this.recenterOffset.bind(this);
    this.zoomAt = this.zoomAt.bind(this);
  }

  private _calculateCanvasSize(): [number, number] {
    return [window.innerWidth - SIDEBAR_WIDTH, window.innerHeight];
  }

  public fitCanvasToWindow(): void {
    const [width, height] = this._calculateCanvasSize();

    // Increase pixel density of canvas to match device
    this._canvas.width = Math.round(PIXEL_RATIO * width);
    this._canvas.height = Math.round(PIXEL_RATIO * height);

    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;

    this._renderSystem.tickLazy();
  }

  public setOffset(x: number, y: number): void {
    this._layoutModel.offsetX = x;
    this._layoutModel.offsetY = y;
  }

  public translateOffset(deltaX: number, deltaY: number): void {
    this._layoutModel.offsetX += deltaX;
    this._layoutModel.offsetY += deltaY;

    this._renderSystem.tickLazy();
  }

  public panInDirection(direction: Direction): void {
    const cellSize = NATURAL_CELL_SIZE * this._layoutModel.zoomScale;
    const panIncrement = cellSize * 10;

    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
      case Direction.Up:
        deltaY += panIncrement;
        break;
      case Direction.Right:
        deltaX -= panIncrement;
        break;
      case Direction.Down:
        deltaY -= panIncrement;
        break;
      case Direction.Left:
        deltaX += panIncrement;
        break;
    }

    this.translateOffset(deltaX, deltaY);
  }

  public recenterOffset(): void {
    const [width, height] = this._calculateCanvasSize();

    const cellSize = NATURAL_CELL_SIZE * this._layoutModel.zoomScale;

    const x = Math.round((width - cellSize) / 2);
    const y = Math.round((height - cellSize) / 2);

    this.setOffset(x, y);
    this.resetZoom();

    this._renderSystem.tickLazy();
  }

  public zoomAt(delta: number, windowX: number, windowY: number): void {
    // Zoom point relative to world offset
    const zoomX = windowX - SIDEBAR_WIDTH - this._layoutModel.offsetX;
    const zoomY = windowY - this._layoutModel.offsetY;

    const normalizedDelta = -delta;

    const oldZoomScale = this._layoutModel.zoomScale;
    let newZoomScale = this._layoutModel.zoomScale * Math.exp(normalizedDelta * ZOOM_INTENSITY);

    // Clamp zoom scale within valid range
    newZoomScale = Math.min(Math.max(newZoomScale, MIN_ZOOM_FACTOR), MAX_ZOOM_FACTOR);

    // Get the canvas position of the mouse after scaling
    const newX = zoomX * (newZoomScale / oldZoomScale);
    const newY = zoomY * (newZoomScale / oldZoomScale);

    // Reverse the translation caused by scaling
    this._layoutModel.offsetX += zoomX - newX;
    this._layoutModel.offsetY += zoomY - newY;

    this._layoutModel.zoomScale = newZoomScale;

    this._renderSystem.tickLazy();
  }

  public resetZoom(): void {
    this._layoutModel.zoomScale = 1;
  }
}