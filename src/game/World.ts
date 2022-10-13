import Cell from "./Cell";
import type { System } from "./systems/System";
import RenderSystem from "./systems/RenderSystem";

export default class World {
  private _playing: boolean = false;

  private _systems: System[] = [];

  // If JS had a way to hash entities for comparison within a Set,
  // we could use a Set for cells instead of a Map.
  public cells = new Map<string, Cell>();
  // Same here - if we could, we would use Cell as the Map key,
  // which would remove the need for Cell.fromHash().
  public cellNeighborCounts = new Map<string, number>();

  public ticks = 0;

  private _incrementNeighborCount(cell: Cell): void {
    const neighborCount = this.cellNeighborCounts.get(cell.hash());
    this.cellNeighborCounts.set(cell.hash(), neighborCount ? neighborCount + 1 : 1);
  }

  private _decrementNeighborCount(cell: Cell): void {
    const neighborCountMinusOne = this.cellNeighborCounts.get(cell.hash()) - 1;

    if (neighborCountMinusOne === 0) {
      this.cellNeighborCounts.delete(cell.hash());
    } else {
      this.cellNeighborCounts.set(cell.hash(), neighborCountMinusOne);
    }
  }

  public spawn(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._incrementNeighborCount(neighbor);
    }

    this.cells.set(cell.hash(), cell);
  }

  public kill(cell: Cell): void {
    for (const neighbor of cell.generateNeighbors()) {
      this._decrementNeighborCount(neighbor);
    }

    this.cells.delete(cell.hash());
  }

  public createCell(x: number, y: number): Cell {
    const cell = new Cell(x, y);
    this.spawn(cell);

    return cell;
  }

  public registerSystem(system: any): void {
    this._systems.push(system);
  }

  public renderBeforeFirstTick(): void {
    if (this.ticks > 0) {
      return;
    }

    this._systems.find(system => system instanceof RenderSystem)?.tick();
  }

  public tick(): void {
    this.ticks++;

    for (const system of this._systems) {
      system.tick();
    }
  }

  public play(): void {
    this._playing = true;

    const autoTick = () => {
      if (this._playing) {
        this.tick();
        requestAnimationFrame(autoTick);
      }
    };

    requestAnimationFrame(autoTick);
  }

  public pause(): void {
    this._playing = false;
  }
}
