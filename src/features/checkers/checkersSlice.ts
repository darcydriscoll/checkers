import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export const PLAYER_ENUM = {
  PLAYER_1: 'PLAYER_1',
  PLAYER_2: 'PLAYER_2',
} as const;

export type Player = (typeof PLAYER_ENUM)[keyof typeof PLAYER_ENUM];

export const PIECE_TYPE_ENUM = {
  MAN: 'MAN',
  KING: 'KING',
} as const;

export type PieceType = (typeof PIECE_TYPE_ENUM)[keyof typeof PIECE_TYPE_ENUM];

export interface Piece {
  player: Player;
  pieceType: PieceType;
}

export interface Space {
  piece?: Piece;
}

export interface CheckersState {
  spaces: Space[][];
}

const emptySpace: Space = { piece: undefined };

const filledSpace = (player: Player): Space => ({
  piece: {
    player: player,
    pieceType: 'MAN',
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
  spaces: [
    initialRowRight('PLAYER_2'),
    initialRowLeft('PLAYER_2'),
    initialRowRight('PLAYER_2'),
    initialRowEmpty,
    initialRowEmpty,
    initialRowLeft('PLAYER_1'),
    initialRowRight('PLAYER_1'),
    initialRowLeft('PLAYER_1'),
  ],
};

export const checkersSlice = createSlice({
  name: 'checkers',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } =
  checkersSlice.actions;

export default checkersSlice.reducer;
