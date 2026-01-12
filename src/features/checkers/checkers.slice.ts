import { createSelector, createSlice } from "@reduxjs/toolkit";
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

export const checkersSlice = createSlice({
  name: "checkers",
  initialState,
  reducers: {},
});

export const selectSquares = (state: RootState) => state.checkers.squares;

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
  currentCol: number
) => {
  const verticalSign = verticalDirection === "UP" ? -1 : 1;
  const horizontalSign = horizontalDirection === "LEFT" ? -1 : 1;

  const move = {
    row: currentRow + verticalSign,
    col: currentCol + verticalSign * horizontalSign,
  };

  if (!isMoveOutOfBounds(squares, move.row, move.col)) {
    if (squares[move.row][move.col].piece === undefined) {
      return move;
    } else {
      move.row = move.row + verticalSign;
      move.col = move.col + verticalSign * horizontalSign;
      if (!isMoveOutOfBounds(squares, move.row, move.col)) {
        if (squares[move.row][move.col].piece === undefined) {
          return move;
        }
      }
    }
  }
};

export const selectAvailableMoves = createSelector(
  [
    selectSquares,
    (_, currentRow: number | null) => currentRow,
    (_, _currentRow: number | null, currentCol: number | null) => currentCol,
  ],
  (
    squares: Square[][],
    currentRow: number | null,
    currentCol: number | null
  ) => {
    if (currentRow === null || currentCol === null) return [];

    const piece = squares[currentRow][currentCol].piece;

    if (piece === undefined) {
      throw new Error(`Empty space, row: ${currentRow}, col: ${currentCol}`);
    }

    const availableMoves = [];

    if (piece.pieceType === "MAN") {
      const verticalDirection = piece.player === "PLAYER_1" ? "UP" : "DOWN";
      availableMoves.push(
        ...[
          getMoveOrUndefined(
            squares,
            verticalDirection,
            "LEFT",
            currentRow,
            currentCol
          ),
          getMoveOrUndefined(
            squares,
            verticalDirection,
            "RIGHT",
            currentRow,
            currentCol
          ),
        ].filter((x) => x !== undefined)
      );
    } else if (piece.pieceType === "KING") {
      availableMoves.push(
        ...[
          getMoveOrUndefined(squares, "UP", "LEFT", currentRow, currentCol),
          getMoveOrUndefined(squares, "UP", "RIGHT", currentRow, currentCol),
          getMoveOrUndefined(squares, "DOWN", "LEFT", currentRow, currentCol),
          getMoveOrUndefined(squares, "DOWN", "RIGHT", currentRow, currentCol),
        ].filter((x) => x !== undefined)
      );
    }

    return availableMoves;
  }
);

export const checkersReducer = checkersSlice.reducer;
