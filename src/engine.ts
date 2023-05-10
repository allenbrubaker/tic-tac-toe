import { injectable } from 'inversify';
import { Board, InvalidBoardError, Player } from './types';

export type BoardIndex = {
  i: number;
  j: number;
};

export interface IEngine {
  create(): Board;
  move(board: Board, player: Player, position: number): Board;
  checkWinner(board: Board, _: BoardIndex): Player | null;
  posToIndex: (pos: number) => BoardIndex;
}

@injectable()
export class Engine implements IEngine {
  create(): Board {
    return Array(3)
      .fill(0)
      .map(x => Array(3).fill(Player.None));
  }

  move(board: Board, player: Player, position: number): Board {
    if (position < 1 || position > 9) {
      throw new InvalidBoardError('position must be in [1,9]');
    }

    const { i, j } = this.posToIndex(position);
    if (board[i][j] !== Player.None) throw new InvalidBoardError('position already used');
    board[i][j] = player;

    return board;
  }

  // It is indubitably faster to use for loops and short circuiting, but leveraging functional programming is cleaner and easier to maintain.
  checkWinner(board: Board, { i, j }: BoardIndex): Player | null {
    if (board.every(row => row.every(x => x !== Player.None))) return Player.Tie;

    const paths = [this.getRow(i, board), this.getCol(j, board)];
    // part of main diagonal
    if (i === j) paths.push(this.getDiagonal(true, board));
    // part of second diagonal
    if (j === 2 - i) paths.push(this.getDiagonal(false, board));
    const winningPath = paths
      .map(p =>
        p.reduce<Partial<Record<Player, number>>>((counts, next) => {
          counts[next] = (counts[next] ?? 0) + 1;
          return counts;
        }, {})
      )
      .filter(x => x.o === 3 || x.x === 3)[0];
    return !winningPath ? null : winningPath.o === 3 ? Player.O : Player.X;
  }

  posToIndex = (pos: number) => {
    return { i: Math.floor((pos - 1) / 3), j: (pos - 1) % 3 };
  };

  private getRow = (index: number, board: Board) => board[index];
  private getCol = (index: number, board: Board) => board.map(row => row[index]);
  private getDiagonal = (main: boolean, board: Board) => board.map((row, i) => (main ? row[i] : row[2 - i]));
}
