import { CellTypes, Moves } from "./enums";

export default class Maze {
    private maze: CellTypes[][];
    private start: number[];
    private end: number[];

    public constructor(start: number[], end: number[], mapData: number[][]) {
        this.start = start;
        this.end = end;
        this.maze = [...mapData].map((array: number[]): number[] => [...array]);
    }

    public move(position: number[], direction: Moves): number[] {
        let newPosition: number[] = [];
        if (direction === Moves.UP) {
            newPosition = [position[0] - 1, position[1]];
        } else if (direction === Moves.RIGHT) {
            newPosition = [position[0], position[1] + 1];
        } else if (direction === Moves.DOWN) {
            newPosition = [position[0] + 1, position[1]];
        } else if (direction === Moves.LEFT) {
            newPosition = [position[0], position[1] - 1];
        }
        return newPosition;
    }

    public getDistanceToEnd(position: number[]): number {
        return Math.abs(this.end[0] - position[0]) + Math.abs(this.end[1] - position[1]);
    }

    public getDistanceFromStart(position: number[]): number {
        return Math.abs(this.start[0] - position[0]) + Math.abs(this.start[1] - position[1]);
    }

    public toString(): string {
        const characters = new Map<CellTypes, string>([
            [CellTypes.OPEN, " "],
            [CellTypes.CLOSED, "▫"],
            [CellTypes.START, "S"],
            [CellTypes.END, "E"],
            [CellTypes.EXPLORED, "■"]
        ]);

        let output = "";
        for (let i = 0; i < this.maze.length; i++) {
            for (let j = 0; j < this.maze[i].length; j++) {
                output += characters.get(this.maze[i][j]) + " ";
            }
            output += "\n";
        }
        return output;
    }

    public getStart(): number[] {
        return this.start;
    }

    public getEnd(): number[] {
        return this.end;
    }

    public getCellType(cell: number[]): CellTypes {
        return this.maze[cell[0]][cell[1]];
    }

    public setCellType(cell: number[], type: CellTypes): void {
        this.maze[cell[0]][cell[1]] = type;
    }
}
