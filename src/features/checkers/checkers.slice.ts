import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../redux/store";

export const PLAYER_ENUM = {
  PLAYER_1: "PLAYER_1",
  PLAYER_2: "PLAYER_2",
} as const;

export type Player = (typeof PLAYER_ENUM)[keyof typeof PLAYER_ENUM];

export const PIECE_TYPE_ENUM = {
  MAN: "MAN",
  KING: "KING",
} as const;

export type PieceType = (typeof PIECE_TYPE_ENUM)[keyof typeof PIECE_TYPE_ENUM];

export interface Piece {
  player: Player;
  pieceType: PieceType;
}

export interface Square {
  piece?: Piece;
}

export interface CheckersState {
  squares: Square[][];
}

const emptySpace: Square = { piece: undefined };

const filledSpace = (player: Player): Square => ({
  piece: {
    player: player,
    pieceType: "MAN",
  },
});

const initialRowRight = (player: Player) => [
  emptySpace,
  filledSpace(player),
  emptySpace,
  filledSpace(player),
  emptySpace,
  filledSpace(player),
  emptySpace,
  filledSpace(player),
];

const initialRowLeft = (player: Player) => [
  filledSpace(player),
  emptySpace,
  filledSpace(player),
  emptySpace,
  filledSpace(player),
  emptySpace,
  filledSpace(player),
  emptySpace,
];

const initialRowEmpty = Array(8).fill(emptySpace);

const initialState: CheckersState = {
  squares: [
    initialRowRight("PLAYER_2"),
    initialRowLeft("PLAYER_2"),
    initialRowRight("PLAYER_2"),
    initialRowEmpty,
    initialRowEmpty,
    initialRowLeft("PLAYER_1"),
    initialRowRight("PLAYER_1"),
    initialRowLeft("PLAYER_1"),
  ],
};

export interface DoMovesPayload {
  row: number;
  col: number;
  moves: Move[];
}

export interface Effect {
  kind: "null" | "capture";
  row: number;
  col: number;
}

export interface NullEffect extends Effect {
  kind: "null";
}

export interface CaptureEffect extends Effect {
  kind: "capture";
  row: number;
  col: number;
}

export interface Move {
  row: number;
  col: number;
  effect: Effect;
}

export const checkersSlice = createSlice({
  name: "checkers",
  initialState,
  reducers: {
    doMoves: (state, action: PayloadAction<DoMovesPayload>) => {
      const payload = action.payload;
      let currentRow = payload.row;
      let currentCol = payload.col;
      payload.moves.forEach((move) => {
        const nextRow = move.row;
        const nextCol = move.col;
        const squares = state.squares;
        squares[nextRow][nextCol] = squares[currentRow][currentCol];
        squares[currentRow][currentCol] = { piece: undefined };

        if (move.effect.kind === "capture") {
          squares[move.effect.row][move.effect.col] = { piece: undefined };
        }

        currentRow = nextRow;
        currentCol = nextCol;
      });
    },
  },
});

export const selectSquares = (state: RootState) => state.checkers.squares;

export const selectPiece = createSelector(
  [
    selectSquares,
    (_, row: number | null) => row,
    (_, _row: number | null, col: number | null) => col,
  ],
  (squares, row, col) => {
    if (row === null || col === null) {
      return null;
    }
    return squares[row][col].piece ?? null;
  },
);

const isMoveOutOfBounds = (squares: Square[][], row: number, col: number) => {
  return (
    row < 0 || row >= squares.length || col < 0 || col >= squares[0].length
  );
};

const getMoveOrUndefined = (
  squares: Square[][],
  verticalDirection: "UP" | "DOWN",
  horizontalDirection: "LEFT" | "RIGHT",
  currentRow: number,
  currentCol: number,
  piece: Piece,
) => {
  const player = piece.player;

  const verticalSign = verticalDirection === "UP" ? -1 : 1;
  const horizontalSign = horizontalDirection === "LEFT" ? -1 : 1;

  const move = {
    row: currentRow + verticalSign,
    col: currentCol + verticalSign * horizontalSign,
  };

  if (!isMoveOutOfBounds(squares, move.row, move.col)) {
    if (squares[move.row][move.col].piece === undefined) {
      return {
        row: move.row,
        col: move.col,
        effect: {} as NullEffect,
      } as Move;
    } else if (squares[move.row][move.col].piece?.player !== player) {
      const takenRow = move.row;
      const takenCol = move.col;
      move.row = move.row + verticalSign;
      move.col = move.col + verticalSign * horizontalSign;
      if (!isMoveOutOfBounds(squares, move.row, move.col)) {
        if (squares[move.row][move.col].piece === undefined) {
          const effect: CaptureEffect = {
            kind: "capture",
            row: takenRow,
            col: takenCol,
          };
          return {
            row: move.row,
            col: move.col,
            effect,
          } as Move;
        }
      }
    }
  }
};

export const selectAvailableMoves = (
  state: RootState,
  currentRow: number | null,
  currentCol: number | null,
  piece: Piece | null,
  previousMoves: Move[],
) => {
  const isPreviousMovesEmpty = previousMoves.length === 0;
  const wasLastMoveACapture =
    !isPreviousMovesEmpty &&
    previousMoves[previousMoves.length - 1].effect.kind === "capture";

  if (
    currentRow === null ||
    currentCol === null ||
    piece === null ||
    (!isPreviousMovesEmpty && !wasLastMoveACapture)
  )
    return [];

  const squares = selectSquares(state);

  const availableMoves: Move[] = [];

  if (piece.pieceType === "MAN") {
    const verticalDirection = piece.player === "PLAYER_1" ? "UP" : "DOWN";
    availableMoves.push(
      ...[
        getMoveOrUndefined(
          squares,
          verticalDirection,
          "LEFT",
          currentRow,
          currentCol,
          piece,
        ),
        getMoveOrUndefined(
          squares,
          verticalDirection,
          "RIGHT",
          currentRow,
          currentCol,
          piece,
        ),
      ].filter((move) => move !== undefined),
    );
  } else if (piece.pieceType === "KING") {
    availableMoves.push(
      ...[
        getMoveOrUndefined(
          squares,
          "UP",
          "LEFT",
          currentRow,
          currentCol,
          piece,
        ),
        getMoveOrUndefined(
          squares,
          "UP",
          "RIGHT",
          currentRow,
          currentCol,
          piece,
        ),
        getMoveOrUndefined(
          squares,
          "DOWN",
          "LEFT",
          currentRow,
          currentCol,
          piece,
        ),
        getMoveOrUndefined(
          squares,
          "DOWN",
          "RIGHT",
          currentRow,
          currentCol,
          piece,
        ),
      ].filter((move) => move !== undefined),
    );
  }

  if (wasLastMoveACapture) {
    return availableMoves.filter((move) => move.effect.kind === "capture");
  }

  return availableMoves;
};

export const { doMoves } = checkersSlice.actions;

export const checkersReducer = checkersSlice.reducer;
